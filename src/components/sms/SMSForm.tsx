
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { DonorFilters } from '@/types';
import { sendSMSToFilteredDonors } from '@/services/smsService';

interface SMSFormProps {
  filters: DonorFilters;
  recipientCount: number;
  onSendSuccess?: (count: number) => void;
}

const formSchema = z.object({
  message: z.string()
    .min(5, { message: 'Message must be at least 5 characters long' })
    .max(160, { message: 'Message cannot exceed 160 characters for SMS' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SMSForm({ 
  filters, 
  recipientCount, 
  onSendSuccess 
}: SMSFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (recipientCount === 0) {
      toast({
        title: 'No Recipients',
        description: 'Please select filters that include at least one donor.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendSMSToFilteredDonors(filters, data.message);
      
      if (result.success) {
        toast({
          title: 'SMS Sent Successfully',
          description: `${result.count} messages have been sent to donors.`,
        });
        
        form.reset();
        
        if (onSendSuccess) {
          onSendSuccess(result.count);
        }
      } else {
        toast({
          title: 'SMS Sending Failed',
          description: result.errors?.map(e => e.error).join(', ') || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'SMS Sending Failed',
        description: (error as Error).message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send SMS</CardTitle>
        <CardDescription>
          Compose a message to send to {recipientCount} donor{recipientCount !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Type your SMS message here..." 
                      className="min-h-[120px]" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Characters: {field.value.length}/160
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="bg-rakta-600 hover:bg-rakta-700"
              disabled={isLoading || recipientCount === 0}
            >
              {isLoading ? 'Sending...' : `Send to ${recipientCount} Recipient${recipientCount !== 1 ? 's' : ''}`}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
