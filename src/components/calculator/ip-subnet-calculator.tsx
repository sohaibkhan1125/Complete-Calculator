"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Address4, Address6 } from 'ip-address';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import Link from 'next/link';

// --- Zod Schemas ---
const ipv4Schema = z.object({
  ipAddress: z.string().refine((val) => {
    try {
      new Address4(val);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Invalid IPv4 address format." }),
  subnet: z.string().min(1, "Subnet mask or CIDR is required."),
});

const ipv6Schema = z.object({
  ipAddress: z.string().refine((val) => {
    try {
      new Address6(val);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Invalid IPv6 address format." }),
  prefix: z.coerce.number().min(0).max(128).default(64),
});

// --- Result Display Components ---
const ResultRow = ({ label, value, canCopy = false }: { label: string; value: string | React.ReactNode; canCopy?: boolean }) => {
  const { toast } = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };
  return (
    <div className="flex justify-between items-center py-2 border-b">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <strong className="text-sm font-mono break-all text-right">{value}</strong>
        {canCopy && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};


const IpSubnetCalculator = () => {
  const { toast } = useToast();
  const [ipv4Result, setIpv4Result] = useState<any>(null);
  const [ipv6Result, setIpv6Result] = useState<any>(null);

  const ipv4Form = useForm<z.infer<typeof ipv4Schema>>({
    resolver: zodResolver(ipv4Schema),
    defaultValues: { ipAddress: "192.168.1.1", subnet: "24" },
  });

  const ipv6Form = useForm<z.infer<typeof ipv6Schema>>({
    resolver: zodResolver(ipv6Schema),
    defaultValues: { ipAddress: "2001:db8:85a3::8a2e:370:7334", prefix: 64 },
  });

  const onIpv4Submit = (values: z.infer<typeof ipv4Schema>) => {
    try {
      const address = new Address4(`${values.ipAddress}/${values.subnet}`);
      setIpv4Result({
        networkAddress: address.startAddress().correctForm(),
        broadcastAddress: address.endAddress().correctForm(),
        subnetMask: address.subnetMask,
        cidr: address.subnet,
        numUsableHosts: address.size - 2 > 0 ? (address.size - 2).toLocaleString() : 0,
        ipRange: `${address.startAddress().correctForm()} - ${address.endAddress().correctForm()}`,
        ipClass: address.address.indexOf('10.') === 0 ? 'A (Private)' : address.address.indexOf('172.16.') === 0 ? 'B (Private)' : address.address.indexOf('192.168.') === 0 ? 'C (Private)' : address.getClass(),
        wildcardMask: address.mask(32 - address.subnet).address,
        binaryIp: address.toBinary(),
        binarySubnet: new Address4(address.subnetMask).toBinary(),
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
      setIpv4Result(null);
    }
  };
  
  const onIpv6Submit = (values: z.infer<typeof ipv6Schema>) => {
     try {
      const address = new Address6(`${values.ipAddress}/${values.prefix}`);
      setIpv6Result({
        networkAddress: address.startAddress().correctForm(),
        usableIpRange: `${address.startAddress().correctForm()} - ${address.endAddress().correctForm()}`,
        prefix: address.subnet,
        numberOfAddresses: address.size.toLocaleString(),
        expandedAddress: address.canonicalForm(),
        subnetId: address.subnetID(),
        interfaceId: address.getInterfaceID(),
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
      setIpv6Result(null);
    }
  };

  return (
    <Tabs defaultValue="ipv4" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="ipv4">IPv4 Calculator</TabsTrigger>
        <TabsTrigger value="ipv6">IPv6 Calculator</TabsTrigger>
      </TabsList>
      <TabsContent value="ipv4">
        <Card>
          <CardHeader><CardTitle>IPv4 Subnet Calculator</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <Form {...ipv4Form}>
              <form onSubmit={ipv4Form.handleSubmit(onIpv4Submit)} className="space-y-4">
                <FormField name="ipAddress" control={ipv4Form.control} render={({ field }) => (<FormItem><FormLabel>IP Address</FormLabel><FormControl><Input {...field} placeholder="e.g., 192.168.1.1" /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="subnet" control={ipv4Form.control} render={({ field }) => (<FormItem><FormLabel>Subnet Mask or CIDR</FormLabel><FormControl><Input {...field} placeholder="e.g., 255.255.255.0 or 24" /></FormControl><FormMessage /></FormItem>)} />
                <Button type="submit" className="w-full">Calculate IPv4</Button>
              </form>
            </Form>
            {ipv4Result && (
              <Card className="bg-muted">
                <CardHeader><CardTitle>IPv4 Results</CardTitle></CardHeader>
                <CardContent>
                  <ResultRow label="Network Address" value={ipv4Result.networkAddress} canCopy />
                  <ResultRow label="Broadcast Address" value={ipv4Result.broadcastAddress} canCopy />
                  <ResultRow label="Usable Host Range" value={ipv4Result.ipRange} canCopy />
                  <ResultRow label="Subnet Mask" value={ipv4Result.subnetMask} canCopy />
                  <ResultRow label="Wildcard Mask" value={ipv4Result.wildcardMask} canCopy />
                  <ResultRow label="Usable Hosts" value={ipv4Result.numUsableHosts} />
                  <ResultRow label="IP Class" value={ipv4Result.ipClass} />
                  <ResultRow label="CIDR Notation" value={`/${ipv4Result.cidr}`} />
                  <ResultRow label="Binary IP" value={ipv4Result.binaryIp} />
                  <ResultRow label="Binary Subnet" value={ipv4Result.binarySubnet} />
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="ipv6">
        <Card>
          <CardHeader><CardTitle>IPv6 Subnet Calculator</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <Form {...ipv6Form}>
              <form onSubmit={ipv6Form.handleSubmit(onIpv6Submit)} className="space-y-4">
                <FormField name="ipAddress" control={ipv6Form.control} render={({ field }) => (<FormItem><FormLabel>IPv6 Address</FormLabel><FormControl><Input {...field} placeholder="e.g., 2001:db8::1" /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="prefix" control={ipv6Form.control} render={({ field }) => (<FormItem><FormLabel>Prefix Length</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g., 64" /></FormControl><FormMessage /></FormItem>)} />
                <Button type="submit" className="w-full">Calculate IPv6</Button>
              </form>
            </Form>
            {ipv6Result && (
              <Card className="bg-muted">
                <CardHeader><CardTitle>IPv6 Results</CardTitle></CardHeader>
                <CardContent>
                  <ResultRow label="Network Address" value={ipv6Result.networkAddress} canCopy />
                  <ResultRow label="Usable IP Range" value={ipv6Result.usableIpRange} canCopy />
                  <ResultRow label="Expanded Address" value={ipv6Result.expandedAddress} canCopy />
                  <ResultRow label="Number of Addresses" value={ipv6Result.numberOfAddresses} />
                  <ResultRow label="Subnet ID" value={ipv6Result.subnetId} canCopy />
                  <ResultRow label="Interface ID" value={ipv6Result.interfaceId} canCopy />
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </TabsContent>
       <Card className="mt-8">
        <CardHeader><CardTitle>Related Tools</CardTitle></CardHeader>
        <CardContent className="flex flex-col space-y-2">
            <Link href="#" className="text-primary hover:underline">IP Address Locator</Link>
            <Link href="#" className="text-primary hover:underline">CIDR Calculator</Link>
            <Link href="#" className="text-primary hover:underline">Network Speed Calculator</Link>
        </CardContent>
      </Card>
    </Tabs>
  );
};

export default IpSubnetCalculator;
