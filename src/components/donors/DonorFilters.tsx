import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { DonorFilters as DonorFiltersType } from "@/types";
import { getUniqueValues } from "@/services/donorService";

interface DonorFiltersProps {
  onFilterChange: (filters: DonorFiltersType) => void;
  isLoading?: boolean;
}

export default function DonorFilters({
  onFilterChange,
  isLoading = false,
}: DonorFiltersProps) {
  const [filters, setFilters] = useState<DonorFiltersType>({
    blood_group: "",
    province: "",
    district: "",
    municipality: "",
  });

  const [bloodGroups, setBloodGroups] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        const [fetchedBloodGroups, fetchedProvinces] = await Promise.all([
          getUniqueValues("blood_group"),
          getUniqueValues("province"),
        ]);

        setBloodGroups(fetchedBloodGroups as string[]);
        setProvinces(fetchedProvinces as string[]);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (filters.province) {
        try {
          const fetchedDistricts = await getUniqueValues("district", {
            province: filters.province,
          });
          setDistricts(fetchedDistricts as string[]);
        } catch (error) {
          console.error("Error fetching districts:", error);
          setDistricts([]);
        }
      } else {
        setDistricts([]);
      }

      setFilters((prev) => ({
        ...prev,
        district: "",
        municipality: "",
      }));
      setMunicipalities([]);
    };
    fetchDistricts();
  }, [filters.province]);

  useEffect(() => {
    const fetchMunicipalities = async () => {
      if (filters.district) {
        try {
          const fetchedMunicipalities = await getUniqueValues("municipality", {
            district: filters.district,
          });
          setMunicipalities(fetchedMunicipalities as string[]);
        } catch (error) {
          console.error("Error fetching municipalities:", error);
          setMunicipalities([]);
        }
      } else {
        setMunicipalities([]);
      }

      setFilters((prev) => ({
        ...prev,
        municipality: "",
      }));
    };
    fetchMunicipalities();
  }, [filters.district]);

  // Update parent component
  useEffect(() => {
    const filtered: DonorFiltersType = {};
    if (filters.blood_group) filtered.blood_group = filters.blood_group;
    if (filters.province) filtered.province = filters.province;
    if (filters.district) filtered.district = filters.district;
    if (filters.municipality) filtered.municipality = filters.municipality;

    onFilterChange(filtered);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof DonorFiltersType, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      blood_group: "",
      province: "",
      district: "",
      municipality: "",
    });
    setDistricts([]);
    setMunicipalities([]);
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* BLOOD GROUP */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <Select
              value={filters.blood_group}
              onValueChange={(val) => handleFilterChange("blood_group", val)}
              disabled={loading || isLoading}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select Blood Group" />
              </SelectTrigger>
              <SelectContent>
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PROVINCE */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Province
            </label>
            <Select
              value={filters.province}
              onValueChange={(val) => handleFilterChange("province", val)}
              disabled={loading || isLoading}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select Province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DISTRICT */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <Select
              value={filters.district}
              onValueChange={(val) => handleFilterChange("district", val)}
              disabled={loading || isLoading || !filters.province}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* MUNICIPALITY */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Municipality
            </label>
            <Select
              value={filters.municipality}
              onValueChange={(val) => handleFilterChange("municipality", val)}
              disabled={loading || isLoading || !filters.district}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select Municipality" />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map((municipality) => (
                  <SelectItem key={municipality} value={municipality}>
                    {municipality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CLEAR FILTERS */}
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
