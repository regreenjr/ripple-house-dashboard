"use client";

import { useDashboardStore } from '@/stores/dashboardStore';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X } from 'lucide-react';
import { formatBrandName } from '@/lib/brandUtils';

interface BrandFilterProps {
  brands: string[];
  isLoading?: boolean;
}

export const BrandFilter = ({ brands, isLoading = false }: BrandFilterProps) => {
  const { selectedBrands, setSelectedBrands } = useDashboardStore();

  const handleToggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleClearAll = () => setSelectedBrands([]);
  const handleSelectAll = () => setSelectedBrands([]); // Empty array = all brands (no filter)

  return (
    <div className="flex-1 min-w-[200px]">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-9 text-xs">
            <span className="truncate">
              {selectedBrands.length === 0
                ? 'All Brands'
                : `${selectedBrands.length} selected`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                disabled={isLoading}
              >
                Select All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearAll}
                disabled={selectedBrands.length === 0}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-4 space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading brands...</p>
            ) : brands.length === 0 ? (
              <p className="text-sm text-muted-foreground">No brands found</p>
            ) : (
              brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
                >
                  <Checkbox
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => handleToggleBrand(brand)}
                  />
                  <span className="text-sm flex-1">{formatBrandName(brand)}</span>
                </label>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedBrands.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedBrands.map((brand) => (
            <Badge key={brand} variant="secondary" className="gap-1">
              {formatBrandName(brand)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleToggleBrand(brand)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
