"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SearchCalculatorsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchCalculators = ({ searchQuery, setSearchQuery }: SearchCalculatorsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Free Online Calculators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center space-x-2">
          <Input 
            type="text" 
            placeholder="Search calculators..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchCalculators;
