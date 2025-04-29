
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { DonorFilters as DonorFiltersType } from '@/types';
import { getUniqueValues } from '@/services/donorService';

interface DonorFiltersProps {
  onFilterChange: (filters: DonorFiltersType) => void;
  isLoading?: boolean;
}

export default function DonorFilters({ onFilterChange, isLoading = false }: DonorFiltersProps) {
  const [filters, setFilters] = useState<DonorFiltersType>({});
  const [bloodGroups, setBloodGroups] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        const [
          fetchedBloodGroups,
          fetchedProvinces,
          fetchedDistricts,
          fetchedMunicipalities
        ] = await Promise.all([
          getUniqueValues('blood_group'),
          getUniqueValues('province'),
          getUniqueValues('district'),
          getUniqueValues('municipality')
        ]);

        setBloodGroups(fetchedBloodGroups as string[]);
        setProvinces(fetchedProvinces as string[]);
        setDistricts(fetchedDistricts as string[]);
        setMunicipalities(fetchedMunicipalities as string[]);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof DonorFiltersType, value: string | undefined) => {
    setFilters(prev => {
      // If value is undefined or empty, remove the filter
      if (!value) {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      
      return { ...prev, [key]: value };
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <Select 
              value={filters.blood_group} 
              onValueChange={(value) => handleFilterChange('blood_group', value)}
              disabled={loading || isLoading}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Blood Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Blood Groups</SelectItem>
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Province
            </label>
            <Select 
              value={filters.province} 
              onValueChange={(value) => handleFilterChange('province', value)}
              disabled={loading || isLoading}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Provinces</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <Select 
              value={filters.district} 
              onValueChange={(value) => handleFilterChange('district', value)}
              disabled={loading || isLoading}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Districts</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Municipality
            </label>
            <Select 
              value={filters.municipality} 
              onValueChange={(value) => handleFilterChange('municipality', value)}
              disabled={loading || isLoading}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Municipalities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Municipalities</SelectItem>
                {municipalities.map((municipality) => (
                  <SelectItem key={municipality} value={municipality}>
                    {municipality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {hasFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="mb-1 flex items-center"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
