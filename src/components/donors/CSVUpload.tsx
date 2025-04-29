
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { DonorForm } from '@/types';
import { Upload } from 'lucide-react';

interface CSVUploadProps {
  onUpload: (donors: DonorForm[]) => void;
  isLoading?: boolean;
}

export default function CSVUpload({ onUpload, isLoading = false }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      const text = await file.text();
      const donors = parseCSV(text);
      
      if (!donors.length) {
        throw new Error('No valid donor records found in the CSV');
      }
      
      onUpload(donors);
      
      toast({
        title: 'CSV Processed',
        description: `Successfully processed ${donors.length} donor records`,
      });
      
      setFile(null);
      
      // Reset the file input
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast({
        title: 'Error Processing CSV',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const parseCSV = (csvText: string): DonorForm[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain headers and at least one donor record');
    }
    
    // Assuming CSV header is in the first line
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    const requiredFields = ['name', 'blood_group', 'phone', 'province', 'district', 'municipality'];
    
    // Check if all required fields are present
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    if (missingFields.length) {
      throw new Error(`CSV is missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Parse donor records
    const donors: DonorForm[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = line.split(',').map(value => value.trim());
      
      // Skip if number of values doesn't match headers
      if (values.length !== headers.length) {
        console.warn(`Skipping line ${i + 1}: incorrect number of values`);
        continue;
      }
      
      const donor: any = {};
      headers.forEach((header, index) => {
        if (requiredFields.includes(header)) {
          donor[header] = values[index];
        }
      });
      
      // Validate required fields are not empty
      const emptyFields = requiredFields.filter(field => !donor[field]);
      if (emptyFields.length) {
        console.warn(`Skipping line ${i + 1}: missing required values for ${emptyFields.join(', ')}`);
        continue;
      }
      
      donors.push(donor as DonorForm);
    }
    
    return donors;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Donors</CardTitle>
        <CardDescription>
          Upload a CSV file with donor information to import in bulk
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid w-full items-center gap-2">
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              CSV must include name, blood_group, phone, province, district, and municipality columns
            </p>
          </div>
          <Button 
            type="button" 
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="bg-rakta-600 hover:bg-rakta-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
