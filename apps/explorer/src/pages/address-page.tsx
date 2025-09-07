import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Wallet,
  CheckCircle,
  FileText,
  Send,
  Download,
  Code,
  Coins,
  Activity
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
  TableRow
} from "@/components/ui/table";
import {
  useAddress,
  useAddressTransactions,
  useAddressTokens
} from "@/hooks/use-address";
import { formatEther } from "viem";
import { formatHash, formatTimestamp } from "@/lib/utils";
import { Link } from "react-router-dom";
import { abiService } from "@/services/abi.service";
import AddressLink from "@/components/blockchain/address-link";
import ContractReadFunctions from "@/components/contract/contract-read-functions";
import ContractWriteFunctions from "@/components/contract/contract-write-functions";
import EthConverter from "@/components/tools/eth-converter";
import { CopyButton } from "@/components/common/copy-button";
import { LoadingState } from "@/components/common/loading-state";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { DataTable } from "@/components/common/data-table";
import type { DataTableColumn } from "@/components/common/data-table";
import { DataTablePagination } from "@/components/common/data-table";

export default function AddressPage() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [txPage, setTxPage] = useState(1);
  const [decodedMethods, setDecodedMethods] = useState<Record<string, string>>({});
  const [abiDecodedMethods, setAbiDecodedMethods] = useState<Set<string>>(new Set());
  const [contractName, setContractName] = useState<string | null>(null);

  const {
    data: addressData,
    isLoading: isLoadingAddress,
    error: addressError
  } = useAddress(address || "");
  const { data: txData, isLoading: isLoadingTx } = useAddressTransactions(
    address || "",
    txPage,
    25
  );
  // const { data: tokenData } = useAddressTokens(address || "");

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
      <div className="min-h-[400px]">
        <LoadingState variant="card" count={2} />
      </div>
    );
  }

  if (addressError || !addressData) {
    return (
      <ErrorState
        error={addressError || "Address not found"}
        title="Address Not Found"
        description={`Address ${address ? formatHash(address, 8) : ""} could not be found`}
        retry={() => window.location.reload()}
      />
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
          <CopyButton
            value={address || ""}
            size="icon"
            variant="ghost"
            className="h-6 w-6"
          />
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
        <TabsList className={`grid w-full ${addressData.isContract ? (contractName ? 'grid-cols-5' : 'grid-cols-3') : 'grid-cols-2'}`}>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Tokens
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
            <CardContent className="p-0">
              <DataTable
                columns={[
                  {
                    accessorKey: 'direction',
                    header: '',
                    headerClassName: 'w-12',
                    cell: (tx: any) => {
                      const isOut = tx.from?.toLowerCase() === address?.toLowerCase();
                      return isOut ? (
                        <Send className="h-4 w-4 text-red-500" />
                      ) : (
                        <Download className="h-4 w-4 text-green-500" />
                      );
                    }
                  },
                  {
                    accessorKey: 'hash',
                    header: 'Transaction Hash',
                    cell: (tx: any) => (
                      <Link
                        to={`/tx/${tx.hash}`}
                        className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {formatHash(tx.hash, 8)}
                      </Link>
                    )
                  },
                  {
                    accessorKey: 'method',
                    header: 'Method',
                    cell: (tx: any) => (
                      <Badge
                        variant={abiDecodedMethods.has(tx.hash) ? "success" : "outline"}
                        className="font-mono text-xs flex items-center gap-1 w-fit"
                      >
                        {getMethodName(tx)}
                        {abiDecodedMethods.has(tx.hash) && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                      </Badge>
                    )
                  },
                  {
                    accessorKey: 'blockNumber',
                    header: 'Block',
                    cell: (tx: any) => (
                      <Link
                        to={`/block/${tx.blockNumber}`}
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tx.blockNumber?.toString()}
                      </Link>
                    )
                  },
                  {
                    accessorKey: 'timestamp',
                    header: 'Age',
                    cell: (tx: any) => (
                      <span className="text-gray-500">
                        {tx.timestamp ? formatTimestamp(tx.timestamp) : "Pending"}
                      </span>
                    )
                  },
                  {
                    accessorKey: 'from',
                    header: 'From',
                    cell: (tx: any) => {
                      const isOut = tx.from?.toLowerCase() === address?.toLowerCase();
                      return isOut ? (
                        <span className="text-gray-600 text-sm">You</span>
                      ) : (
                        <AddressLink address={tx.from || ""} truncate={6} showBadge={false} />
                      );
                    }
                  },
                  {
                    accessorKey: 'to',
                    header: 'To',
                    cell: (tx: any) => {
                      const isOut = tx.from?.toLowerCase() === address?.toLowerCase();
                      return !isOut ? (
                        <span className="text-gray-600 text-sm">You</span>
                      ) : tx.to ? (
                        <AddressLink address={tx.to} truncate={6} showBadge={false} />
                      ) : (
                        <Badge variant="warning" className="text-xs">
                          Contract Creation
                        </Badge>
                      );
                    }
                  },
                  {
                    accessorKey: 'value',
                    header: 'Value',
                    headerClassName: 'text-right',
                    className: 'text-right',
                    cell: (tx: any) => {
                      const isOut = tx.from?.toLowerCase() === address?.toLowerCase();
                      return (
                        <span className={`font-mono ${isOut ? "text-red-500" : "text-green-500"}`}>
                          {isOut ? "-" : "+"}
                          {formatEther(tx.value || 0n)} ETH
                        </span>
                      );
                    }
                  },
                ] as DataTableColumn<any>[]}
                data={txData?.transactions}
                loading={isLoadingTx}
                emptyMessage="No transactions found"
                emptyDescription="This address has no transaction history."
                emptyIcon={Activity}
                onRowClick={(tx) => navigate(`/tx/${tx.hash}`)}
                skeletonRows={10}
              />
              
              {/* Pagination */}
              {txData?.pagination && txData.pagination.totalPages > 1 && (
                <div className="p-4 border-t">
                  <DataTablePagination
                    currentPage={txPage}
                    totalPages={txData.pagination.totalPages}
                    onPageChange={setTxPage}
                  />
                  
                  {/* Page info */}
                  <div className="text-center text-sm text-gray-500 mt-4">
                    Showing transactions {((txPage - 1) * 25) + 1} to{' '}
                    {Math.min(txPage * 25, txData.total)} of{' '}
                    {txData.total.toLocaleString()}
                  </div>
                </div>
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
              <EmptyState
                icon={Coins}
                title="Token tracking coming soon"
                description="Token tracking requires event indexing. This feature will be available soon."
                variant="compact"
              />
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
                    <CopyButton
                      value={addressData.code || ""}
                      variant="outline"
                      label="Copy Bytecode"
                    />
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
