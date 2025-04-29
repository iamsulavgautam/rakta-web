
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DonorForm from '@/components/donors/DonorForm';
import { DonorForm as DonorFormType } from '@/types';
import { createDonor } from '@/services/donorService';
import { ArrowLeft } from 'lucide-react';

export default function AddDonor() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (data: DonorFormType) => {
    try {
      setIsLoading(true);
      await createDonor(data);
      
      toast({
        title: 'Donor Added',
        description: 'New donor has been added successfully',
      });
      
      navigate('/donors');
    } catch (error) {
      console.error('Error adding donor:', error);
      toast({
        title: 'Error',
        description: 'Failed to add donor',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Donor</h2>
            <p className="text-muted-foreground">
              Enter details to add a new blood donor
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/donors')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donors
          </Button>
        </div>

        <div className="border rounded-lg p-6 bg-white">
          <DonorForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
