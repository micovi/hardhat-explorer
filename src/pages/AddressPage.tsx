import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Wallet,
  Copy,
  CheckCircle,
  FileText,
  Send,
  Download,
  Code,
  Coins,
  Image,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddress,
  useAddressTransactions,
  useAddressTokens,
} from "@/hooks/useAddress";
import { formatEther } from "viem";
import { formatHash, formatTimestamp } from "@/lib/utils";
import { Link } from "react-router-dom";
import { abiService } from "@/services/abiService";
import AddressLink from "@/components/blockchain/AddressLink";
import ContractReadFunctions from "@/components/contract/ContractReadFunctions";
import ContractWriteFunctions from "@/components/contract/ContractWriteFunctions";
import EthConverter from "@/components/tools/EthConverter";

export default function AddressPage() {
  const { address } = useParams<{ address: string }>();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [txPage, setTxPage] = useState(1);
  const [decodedMethods, setDecodedMethods] = useState<Record<string, string>>({});
  const [abiDecodedMethods, setAbiDecodedMethods] = useState<Set<string>>(new Set());
  const [contractName, setContractName] = useState<string | null>(null);

  const {
    data: addressData,
    isLoading: isLoadingAddress,
    error: addressError,
  } = useAddress(address || "");
  const { data: txData, isLoading: isLoadingTx } = useAddressTransactions(
    address || "",
    txPage,
    25
  );
  const { data: tokenData } = useAddressTokens(address || "");

  // Load contract name if verified
  useEffect(() => {
    const loadContractName = async () => {
      if (!address) return;
      const name = await abiService.getContractName(address);
      setContractName(name);
    };
    loadContractName();
  }, [address]);

  // Decode transaction methods
  useEffect(() => {
    const decodeMethods = async () => {
      if (!txData?.transactions) return;
      
      const decoded: Record<string, string> = {};
      const abiDecoded = new Set<string>();
      
      for (const tx of txData.transactions) {
        if (tx.to && tx.input && tx.input !== '0x') {
          const result = await abiService.decodeFunctionCall(tx.to, tx.input);
          if (result) {
            decoded[tx.hash] = result.functionName;
            abiDecoded.add(tx.hash);
          } else {
            // Fall back to method signature
            decoded[tx.hash] = abiService.getMethodSignature(tx.input);
          }
        } else {
          decoded[tx.hash] = 'Transfer';
        }
      }
      
      setDecodedMethods(decoded);
      setAbiDecodedMethods(abiDecoded);
    };
    
    decodeMethods();
  }, [txData]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getMethodName = (tx: any): string => {
    // First check if we have decoded data from ABI
    if (decodedMethods[tx.hash]) {
      return decodedMethods[tx.hash];
    }
    // Fall back to signature detection
    return abiService.getMethodSignature(tx.input || '');
  };

  if (isLoadingAddress) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (addressError || !addressData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Address Not Found</h2>
        <p className="text-gray-500 mt-2">
          Address {address ? truncateAddress(address, 8) : ""} could not be
          found
        </p>
      </div>
    );
  }

  const balance = formatEther(addressData.balance);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          {addressData.isContract ? (
            <>
              <Code className="h-8 w-8" />
              {contractName || "Contract"}
            </>
          ) : (
            <>
              <Wallet className="h-8 w-8" />
              Address
            </>
          )}
          {contractName && (
            <Badge variant="success" className="ml-2">
              <CheckCircle className="h-4 w-4 mr-1" />
              Verified
            </Badge>
          )}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <p className="font-mono text-sm text-gray-600">{address}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(address || "", "address")}
            className="h-6 w-6 p-0"
          >
            {copiedField === "address" ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500">Balance:</label>
              <p className="font-mono text-lg font-medium">
                {parseFloat(balance) > 0 ? `${balance} ETH` : "0 ETH"}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Type:</label>
              <div className="mt-1">
                {addressData.isContract ? (
                  <Badge variant="secondary" className="gap-1">
                    <Code className="h-3 w-3" />
                    Contract
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Wallet className="h-3 w-3" />
                    EOA (Externally Owned Account)
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Transactions:</label>
              <p className="font-mono">{addressData.transactionCount}</p>
            </div>

            {addressData.isContract && (
              <div className="flex items-center gap-2">
                <Link to={`/verify-contract/${address}`}>
                  <Button variant="outline" size="sm" className="mt-1">
                    Verify & Publish
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Transactions, Tokens, etc */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className={`grid w-full ${addressData.isContract ? (contractName ? 'grid-cols-6' : 'grid-cols-4') : 'grid-cols-3'}`}>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="nfts" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            NFTs
          </TabsTrigger>
          {addressData.isContract && contractName && (
            <>
              <TabsTrigger value="read" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Read
              </TabsTrigger>
              <TabsTrigger value="write" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Write
              </TabsTrigger>
            </>
          )}
          {addressData.isContract && (
            <TabsTrigger value="contract" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Contract
            </TabsTrigger>
          )}
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTx ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : txData && txData.transactions.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Transaction Hash</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Block</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {txData.transactions.map((tx) => {
                        const isOut =
                          tx.from?.toLowerCase() === address?.toLowerCase();
                        return (
                          <TableRow key={tx.hash}>
                            <TableCell>
                              {isOut ? (
                                <Send className="h-4 w-4 text-red-500" />
                              ) : (
                                <Download className="h-4 w-4 text-green-500" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Link
                                to={`/tx/${tx.hash}`}
                                className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                              >
                                {formatHash(tx.hash, 8)}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={abiDecodedMethods.has(tx.hash) ? "success" : "outline"}
                                className="font-mono text-xs flex items-center gap-1 w-fit"
                              >
                                {getMethodName(tx)}
                                {abiDecodedMethods.has(tx.hash) && (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Link
                                to={`/block/${tx.blockNumber}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {tx.blockNumber?.toString()}
                              </Link>
                            </TableCell>
                            <TableCell className="text-gray-500">
                              {tx.timestamp
                                ? formatTimestamp(tx.timestamp)
                                : "Pending"}
                            </TableCell>
                            <TableCell>
                              {isOut ? (
                                <span className="text-gray-600 text-sm">You</span>
                              ) : (
                                <AddressLink address={tx.from || ""} truncate={6} showBadge={false} />
                              )}
                            </TableCell>
                            <TableCell>
                              {!isOut ? (
                                <span className="text-gray-600 text-sm">You</span>
                              ) : tx.to ? (
                                <AddressLink address={tx.to} truncate={6} showBadge={false} />
                              ) : (
                                <Badge variant="warning" className="text-xs">
                                  Contract Creation
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              <span
                                className={
                                  isOut ? "text-red-500" : "text-green-500"
                                }
                              >
                                {isOut ? "-" : "+"}
                                {formatEther(tx.value || 0n)} ETH
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {txData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-500">
                        Showing {(txPage - 1) * 25 + 1} to{" "}
                        {Math.min(txPage * 25, txData.total)} of {txData.total}{" "}
                        transactions
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                          disabled={!txData.pagination.hasPrevPage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTxPage((p) => p + 1)}
                          disabled={!txData.pagination.hasNextPage}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No transactions found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tokens Tab */}
        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <CardTitle>Token Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Token tracking requires event indexing. This feature will be
                available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NFTs Tab */}
        <TabsContent value="nfts">
          <Card>
            <CardHeader>
              <CardTitle>NFT Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                NFT tracking requires event indexing. This feature will be
                available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Read Contract Tab (only for verified contracts) */}
        {addressData.isContract && contractName && (
          <TabsContent value="read">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ContractReadFunctions address={address || ''} />
              </div>
              <div>
                <EthConverter />
              </div>
            </div>
          </TabsContent>
        )}

        {/* Write Contract Tab (only for verified contracts) */}
        {addressData.isContract && contractName && (
          <TabsContent value="write">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ContractWriteFunctions address={address || ''} />
              </div>
              <div>
                <EthConverter />
              </div>
            </div>
          </TabsContent>
        )}

        {/* Contract Tab (only for contracts) */}
        {addressData.isContract && (
          <TabsContent value="contract">
            <Card>
              <CardHeader>
                <CardTitle>Contract Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">
                      Contract Code:
                    </label>
                    <pre className="bg-gray-50 rounded-md p-4 font-mono text-xs overflow-x-auto mt-2">
                      {addressData.code?.slice(0, 500)}...
                    </pre>
                  </div>
                  <div className="flex gap-4">
                    <Link to={`/verify-contract/${address}`}>
                      <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Verify & Publish
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(addressData.code || "", "code")
                      }
                    >
                      {copiedField === "code" ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Bytecode
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
