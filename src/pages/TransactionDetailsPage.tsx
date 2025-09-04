import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Loader2,
  ArrowLeft,
  Copy,
  CheckCircle,
  XCircle,
  ArrowRight,
  Activity,
  Code,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransaction } from "@/hooks/useTransactions";
import { formatTimestamp, formatHash } from "@/lib/utils";
import { formatEther, formatGwei } from "viem";
import { useState, useEffect } from "react";
import { abiService } from "@/services/abiService";
import AddressLink from "@/components/blockchain/AddressLink";

export default function TransactionDetailsPage() {
  const { hash } = useParams<{ hash: string }>();
  const { data: tx, isLoading, error } = useTransaction(hash || "");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [decodedData, setDecodedData] = useState<{
    functionName: string;
    args: any;
  } | null>(null);
  const [decodedLogs, setDecodedLogs] = useState<
    Map<number, { eventName: string; args: any }>
  >(new Map());

  // Decode transaction data and logs using ABI
  useEffect(() => {
    const decodeTransaction = async () => {
      if (!tx || !tx.to) return;

      // Decode function call
      if (tx.input && tx.input !== "0x") {
        try {
          const decoded = await abiService.decodeFunctionCall(tx.to, tx.input);
          if (decoded) {
            setDecodedData(decoded);
          }
        } catch (err) {
          console.error("Failed to decode function call:", err);
        }
      }

      // Decode event logs
      if (tx.logs && tx.logs.length > 0) {
        const decodedMap = new Map<number, { eventName: string; args: any }>();

        for (let i = 0; i < tx.logs.length; i++) {
          const log = tx.logs[i];
          try {
            const decoded = await abiService.decodeEvent(log.address, log);
            if (decoded) {
              decodedMap.set(i, decoded);
            }
          } catch (err) {
            console.error(`Failed to decode log ${i}:`, err);
          }
        }

        setDecodedLogs(decodedMap);
      }
    };

    decodeTransaction();
  }, [tx]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getMethodName = (): string => {
    // First check if we have decoded data
    if (decodedData?.functionName) {
      return decodedData.functionName;
    }

    // Fall back to method signature detection
    if (!tx?.input || tx.input === "0x") return "Transfer";
    return abiService.getMethodSignature(tx.input);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">
          Transaction Not Found
        </h2>
        <p className="text-gray-500 mt-2">
          Transaction {hash ? formatHash(hash, 10) : ""} could not be found
        </p>
        <Link to="/txs">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Button>
        </Link>
      </div>
    );
  }

  const value = formatEther(tx.value || 0n);
  const gasPrice = tx.effectiveGasPrice || tx.gasPrice || tx.maxFeePerGas || 0n;
  const gasUsed = tx.gasUsed || 0n;
  const gasLimit = tx.gas || 0n;
  const gasFee = gasPrice && gasUsed ? formatEther(gasPrice * gasUsed) : "0";
  const method = getMethodName();
  // Check status - can be 'success', 1, '0x1', or undefined (which means success for old transactions)
  const status =
    tx.status === undefined ||
    tx.status === "success" ||
    tx.status === 1 ||
    tx.status === "0x1" ||
    tx.status === 1n;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Transaction Details
        </h1>
        <p className="text-gray-500 mt-2">
          {status ? (
            <Badge variant="success" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Success
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Failed
            </Badge>
          )}
        </p>
      </div>

      {/* Transaction Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Transaction Hash */}
            <div>
              <label className="text-sm text-gray-500">Transaction Hash:</label>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm break-all">{tx.hash}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(tx.hash, "hash")}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  {copiedField === "hash" ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Status and Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Status:</label>
                <div className="mt-1">
                  {status ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Success
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Failed
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Block:</label>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/block/${tx.blockNumber}`}
                    className="text-blue-600 hover:text-blue-800 font-mono"
                  >
                    {tx.blockNumber?.toString()}
                  </Link>
                  <span className="text-sm text-gray-500">
                    ({tx.confirmations || 0} confirmations)
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            {tx.timestamp && (
              <div>
                <label className="text-sm text-gray-500">Timestamp:</label>
                <p>{formatTimestamp(tx.timestamp)}</p>
              </div>
            )}

            {/* From and To */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 w-20">From:</div>
                <AddressLink address={tx.from} truncate={12} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(tx.from, "from")}
                  className="h-6 w-6 p-0"
                >
                  {copiedField === "from" ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 w-20">
                  {tx.to ? "To:" : "Created:"}
                </div>
                {tx.to ? (
                  <>
                    <AddressLink address={tx.to} truncate={12} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(tx.to, "to")}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === "to" ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                ) : tx.contractAddress ? (
                  <>
                    <AddressLink address={tx.contractAddress} truncate={12} />
                    <Badge variant="warning" className="ml-2">
                      Contract Creation
                    </Badge>
                  </>
                ) : (
                  <Badge variant="warning">Contract Creation</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-8">
              {/* Value */}
              <div>
                <div className="text-sm text-gray-500">Value:</div>
                <p className="font-mono font-medium text-lg">
                  {parseFloat(value) > 0 ? `${value} ETH` : "0 ETH"}
                </p>
              </div>

              {/* Transaction Fee */}
              <div>
                <div className="text-sm text-gray-500">Transaction Fee:</div>
                <p className="font-mono">
                  {gasFee} ETH
                  <span className="text-sm text-gray-500 ml-2">
                    ({gasPrice ? formatGwei(gasPrice) : "0"} Gwei ×{" "}
                    {gasUsed?.toString()})
                  </span>
                </p>
              </div>

              {/* Method */}
              <div>
                <div className="text-sm text-gray-500">Method:</div>
                <Badge variant="secondary" className="font-mono">
                  {method}
                  {decodedData && (
                    <CheckCircle className="ml-1 h-3 w-3 text-green-600" />
                  )}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-500">Nonce:</div>
                <p className="font-mono">{tx.nonce}</p>
              </div>
              <div>
                <div className="text-sm text-gray-500">Type:</div>
                <p className="font-mono">
                  {tx.type === 2 || tx.type === "0x2"
                    ? "EIP-1559"
                    : tx.type === 1 || tx.type === "0x1"
                    ? "EIP-2930"
                    : "Legacy"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gas Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Gas Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-500">Gas Limit:</label>
              <p className="font-mono">{gasLimit.toString()}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Gas Used:</label>
              <p className="font-mono">
                {gasUsed.toString()}
                {gasLimit > 0n && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({((Number(gasUsed) / Number(gasLimit)) * 100).toFixed(2)}%)
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Gas Price:</label>
              <p className="font-mono">
                {gasPrice ? formatGwei(gasPrice) : "0"} Gwei
              </p>
            </div>
            {tx.maxFeePerGas && (
              <>
                <div>
                  <label className="text-sm text-gray-500">
                    Max Fee Per Gas:
                  </label>
                  <p className="font-mono">
                    {formatGwei(tx.maxFeePerGas)} Gwei
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Max Priority Fee:
                  </label>
                  <p className="font-mono">
                    {tx.maxPriorityFeePerGas
                      ? formatGwei(tx.maxPriorityFeePerGas)
                      : "0"}{" "}
                    Gwei
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Base Fee:</label>
                  <p className="font-mono">
                    {tx.baseFeePerGas ? formatGwei(tx.baseFeePerGas) : "N/A"}{" "}
                    Gwei
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input Data Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Input Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tx.input && tx.input !== "0x" ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Function:</label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    {method}
                  </Badge>
                  {decodedData && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Decoded
                    </Badge>
                  )}
                </div>
              </div>

              {/* Decoded Parameters */}
              {decodedData && decodedData.args && (
                <div>
                  <label className="text-sm text-gray-500">
                    Decoded Input:
                  </label>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-2">
                    <div className="space-y-2">
                      {Array.isArray(decodedData.args) ? (
                        decodedData.args.map((arg: any, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-sm text-gray-600">
                              arg[{index}]:
                            </span>
                            <span className="font-mono text-sm break-all">
                              {typeof arg === "bigint"
                                ? arg.toString()
                                : typeof arg === "object"
                                ? JSON.stringify(arg)
                                : String(arg)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="font-mono text-sm">
                          {JSON.stringify(
                            decodedData.args,
                            (key, value) =>
                              typeof value === "bigint"
                                ? value.toString()
                                : value,
                            2
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-500">Raw Input Data:</label>
                <div className="relative">
                  <pre className="bg-gray-50 rounded-md p-4 font-mono text-xs overflow-x-auto max-h-32">
                    {tx.input.length > 200
                      ? `${tx.input.slice(0, 200)}...`
                      : tx.input}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(tx.input, "input")}
                    className="absolute top-2 right-2"
                  >
                    {copiedField === "input" ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {!decodedData && tx.to && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <p>⚠️ To decode input data, </p>
                  <Link
                    to={`/verify-contract/${tx.to}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    verify this contract
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No input data</p>
          )}
        </CardContent>
      </Card>

      {/* Event Logs Card */}
      {tx.logs && tx.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Event Logs ({tx.logs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Index</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tx.logs.map((log: any, index: number) => {
                  const decodedLog = decodedLogs.get(index);
                  return (
                    <TableRow key={index}>
                      <TableCell>{log.logIndex ?? index}</TableCell>
                      <TableCell>
                        <AddressLink address={log.address} />
                      </TableCell>
                      <TableCell>
                        {decodedLog ? (
                          <div className="space-y-2">
                            <Badge variant="success" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {decodedLog.eventName}
                            </Badge>
                            <div className="text-xs space-y-1">
                              {Array.isArray(decodedLog.args) ? (
                                decodedLog.args.map((arg: any, i: number) => (
                                  <div key={i} className="text-gray-600">
                                    arg[{i}]:{" "}
                                    <span className="font-mono">
                                      {typeof arg === "bigint"
                                        ? arg.toString()
                                        : typeof arg === "object"
                                        ? JSON.stringify(arg)
                                        : String(arg).length > 30
                                        ? `${String(arg).slice(0, 30)}...`
                                        : String(arg)}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="font-mono">
                                  {JSON.stringify(
                                    decodedLog.args,
                                    (key, value) =>
                                      typeof value === "bigint"
                                        ? value.toString()
                                        : value,
                                    2
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {log.topics?.map((topic: string, i: number) => (
                              <div key={i} className="font-mono text-xs">
                                [{i}] {formatHash(topic, 10)}
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs max-w-[200px] truncate">
                          {log.data || "0x"}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {decodedLogs.size === 0 && tx.logs.length > 0 && (
              <p className="text-sm text-gray-500 mt-4">
                ⚠️ To decode events, verify the contracts and upload their ABIs
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
