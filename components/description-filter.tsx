"use client";

import { useState, useMemo } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown,
  X,
  Search,
  FileText,
  Filter,
  Calendar
} from 'lucide-react';
import { DescriptionOption } from '@/types/video';
import { truncateText } from '@/lib/descriptionUtils';
import { formatDateCompact } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface DescriptionFilterProps {
  availableOptions: DescriptionOption[];
  isLoading?: boolean;
}

export const DescriptionFilter = ({
  availableOptions,
  isLoading = false
}: DescriptionFilterProps) => {
  const {
    selectedDescriptions,
    setSelectedDescriptions,
    descriptionMatchMode,
    setDescriptionMatchMode,
    descriptionCombineMode,
    setDescriptionCombineMode,
    clearDescriptionFilter
  } = useDashboardStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filtra opções baseado na busca
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      // Limite inicial: top 250 por frequência
      return availableOptions.slice(0, 250);
    }

    const search = searchTerm.toLowerCase();
    return availableOptions.filter(opt =>
      opt.normalizedText.includes(search)
    );
  }, [availableOptions, searchTerm]);

  // Obtém textos das descrições selecionadas
  const selectedTexts = useMemo(() => {
    return availableOptions
      .filter(opt => selectedDescriptions.includes(opt.id))
      .map(opt => opt.text);
  }, [availableOptions, selectedDescriptions]);

  const handleToggleDescription = (id: string) => {
    if (selectedDescriptions.includes(id)) {
      setSelectedDescriptions(selectedDescriptions.filter(d => d !== id));
    } else {
      setSelectedDescriptions([...selectedDescriptions, id]);
    }
  };

  const handleClearAll = () => {
    clearDescriptionFilter();
  };

  return (
    <div className="flex-1 min-w-[240px]">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-9 text-xs"
            disabled={isLoading || availableOptions.length === 0}
          >
            <span className="truncate flex items-center gap-2">
              {selectedDescriptions.length === 0 ? (
                <>
                  <Filter className="h-3 w-3" />
                  Filter by descriptions...
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {selectedDescriptions.length}
                  </Badge>
                  {selectedDescriptions.length === 1 ? '1 selected' : `${selectedDescriptions.length} selected`}
                </>
              )}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[480px] p-0" align="start">
          {/* Header: Controles de Modo */}
          <div className="p-4 space-y-3 border-b">
            {/* Match Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Match mode:</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={descriptionMatchMode === 'exact' ? 'default' : 'outline'}
                  onClick={() => setDescriptionMatchMode('exact')}
                  className="h-7 px-3 text-xs"
                >
                  Exact
                </Button>
                <Button
                  size="sm"
                  variant={descriptionMatchMode === 'contains' ? 'default' : 'outline'}
                  onClick={() => setDescriptionMatchMode('contains')}
                  className="h-7 px-3 text-xs"
                >
                  Contains
                </Button>
              </div>
            </div>

            {/* Combine Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Combine with:</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={descriptionCombineMode === 'OR' ? 'default' : 'outline'}
                  onClick={() => setDescriptionCombineMode('OR')}
                  className="h-7 px-3 text-xs"
                >
                  OR
                </Button>
                <Button
                  size="sm"
                  variant={descriptionCombineMode === 'AND' ? 'default' : 'outline'}
                  onClick={() => setDescriptionCombineMode('AND')}
                  className="h-7 px-3 text-xs"
                >
                  AND
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 border-b flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearAll}
              disabled={selectedDescriptions.length === 0}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Apply
            </Button>
          </div>

          {/* Options List */}
          <ScrollArea className="h-80">
            <div className="p-3 space-y-1">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading descriptions...
                </p>
              ) : filteredOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchTerm
                    ? 'No descriptions match your search'
                    : 'No descriptions found for current period/brands'}
                </p>
              ) : (
                <>
                  {filteredOptions.map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "flex items-start gap-3 cursor-pointer hover:bg-accent p-2.5 rounded transition-colors",
                        selectedDescriptions.includes(option.id) && "bg-accent/50"
                      )}
                      title={option.text}
                    >
                      <Checkbox
                        checked={selectedDescriptions.includes(option.id)}
                        onCheckedChange={() => handleToggleDescription(option.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-tight break-words">
                          {truncateText(option.text, 80)}
                        </p>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          <p className="text-xs text-muted-foreground">
                            {option.count} {option.count === 1 ? 'video' : 'videos'}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {option.firstPosted === option.lastPosted ? (
                              <span>Posted: {formatDateCompact(option.firstPosted)}</span>
                            ) : (
                              <span>
                                {formatDateCompact(option.firstPosted)} - {formatDateCompact(option.lastPosted)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}

                  {availableOptions.length > 250 && !searchTerm && (
                    <div className="pt-2 pb-1">
                      <Separator className="mb-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        Showing top 250 of {availableOptions.length} descriptions.
                        <br />
                        Use search to find more.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected Chips */}
      {selectedDescriptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedTexts.slice(0, 3).map((text, index) => (
            <Badge
              key={selectedDescriptions[index]}
              variant="secondary"
              className="gap-1.5 max-w-[200px]"
            >
              <span className="truncate">{truncateText(text, 30)}</span>
              <X
                className="h-3 w-3 cursor-pointer shrink-0"
                onClick={() => handleToggleDescription(selectedDescriptions[index])}
              />
            </Badge>
          ))}

          {selectedDescriptions.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{selectedDescriptions.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Help Text */}
      {selectedDescriptions.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Mode: <span className="font-medium">{descriptionMatchMode}</span> •
          Combine: <span className="font-medium">{descriptionCombineMode}</span>
        </p>
      )}
    </div>
  );
};
