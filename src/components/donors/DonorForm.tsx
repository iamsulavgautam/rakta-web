import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DonorForm as DonorFormType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Full Location Data
const locationData = {
  "Province 1": {
    Bhojpur: ["Bhojpur Municipality", "Shadananda Municipality"],
    Morang: ["Biratnagar", "Urlabari", "Rangeli"],
    Sunsari: ["Itahari", "Dharan", "Inaruwa"],
    Dhankuta: ["Dhankuta Municipality"],
    Panchthar: ["Phidim Municipality"],
    Ilam: ["Ilam Municipality", "Suryodaya Municipality"],
    Jhapa: ["Birtamode", "Mechinagar", "Damak"],
    Sankhuwasabha: ["Khandbari Municipality"],
    Tehrathum: ["Myanglung Municipality"],
    Udayapur: ["Gaighat Municipality", "Katari Municipality"],
    Okhaldhunga: ["Okhaldhunga Municipality"],
    Khotang: ["Diktel Municipality"],
    Solukhumbu: ["Salleri Municipality"],
    Taplejung: ["Phungling Municipality"],
  },
  "Madhesh Pradesh": {
    Saptari: ["Rajbiraj Municipality", "Kanchanrup Municipality"],
    Siraha: ["Lahan Municipality", "Siraha Municipality"],
    Dhanusha: ["Janakpur", "Mithila Municipality"],
    Mahottari: ["Jaleshwar Municipality", "Bardibas Municipality"],
    Sarlahi: ["Malangwa Municipality", "Haripur Municipality"],
    Bara: ["Kalaiya Municipality", "Simraungadh Municipality"],
    Parsa: ["Birgunj", "Pokhariya Municipality"],
    Rautahat: ["Gaur Municipality", "Garuda Municipality"],
  },
  Bagmati: {
    Kathmandu: ["Kathmandu", "Kirtipur", "Tokha"],
    Lalitpur: ["Lalitpur", "Godawari", "Mahalaxmi Municipality"],
    Bhaktapur: ["Bhaktapur", "Madhyapur Thimi", "Changunarayan"],
    Makwanpur: ["Hetauda", "Thaha Municipality"],
    Chitwan: ["Bharatpur", "Ratnanagar", "Khairahani"],
    Kavrepalanchok: ["Banepa", "Dhulikhel", "Panauti"],
    Sindhuli: ["Kamalamai Municipality"],
    Ramechhap: ["Manthali Municipality"],
    Dolakha: ["Bhimeshwar Municipality"],
    Sindhupalchok: ["Chautara Sangachokgadhi Municipality"],
    Nuwakot: ["Bidur Municipality"],
    Rasuwa: ["Uttargaya Rural Municipality"],
  },
  Gandaki: {
    Kaski: ["Pokhara", "Lekhnath"],
    Lamjung: ["Besisahar Municipality"],
    Tanahun: ["Damauli Municipality"],
    Syangja: ["Waling Municipality"],
    Gorkha: ["Gorkha Municipality"],
    Baglung: ["Baglung Municipality"],
    Myagdi: ["Beni Municipality"],
    Parbat: ["Kushma Municipality"],
    Manang: ["Chame Rural Municipality"],
    Mustang: ["Jomsom Rural Municipality"],
  },
  Lumbini: {
    Dang: ["Ghorahi", "Tulsipur", "Lamahi"],
    Banke: ["Nepalgunj", "Kohalpur"],
    Rupandehi: ["Butwal", "Siddharthanagar", "Tilottama"],
    Kapilvastu: ["Taulihawa Municipality"],
    Palpa: ["Tansen Municipality"],
    Gulmi: ["Tamghas Municipality"],
    Arghakhanchi: ["Sandhikharka Municipality"],
    Bardiya: ["Gulariya Municipality"],
    Parasi: ["Ramgram Municipality"],
    Rolpa: ["Liwang Municipality"],
    Pyuthan: ["Pyuthan Municipality"],
  },
  Karnali: {
    Surkhet: ["Birendranagar Municipality"],
    Dailekh: ["Narayan Municipality"],
    Jajarkot: ["Khalanga Municipality"],
    Salyan: ["Sharada Municipality"],
    "Rukum West": ["Musikot Municipality"],
    "Rukum East": ["Putha Uttarganga"],
    Dolpa: ["Dunai Municipality"],
    Humla: ["Simikot Rural Municipality"],
    Mugu: ["Gamgadhi Municipality"],
    Jumla: ["Chandannath Municipality"],
    Kalikot: ["Manma Municipality"],
  },
  Sudurpashchim: {
    Kailali: ["Dhangadhi", "Tikapur Municipality"],
    Kanchanpur: ["Mahendranagar Municipality"],
    Dadeldhura: ["Amargadhi Municipality"],
    Doti: ["Dipayal Silgadhi Municipality"],
    Baitadi: ["Dasharathchand Municipality"],
    Bajhang: ["Chainpur Municipality"],
    Bajura: ["Martadi Municipality"],
    Achham: ["Mangalsen Municipality"],
    Darchula: ["Darchula Municipality"],
  },
};

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  blood_group: z.string().min(1, { message: "Blood group is required." }),
  phone: z.string().min(10, { message: "Phone number must be valid." }),
  province: z.string().min(1, { message: "Province is required." }),
  district: z.string().min(1, { message: "District is required." }),
  municipality: z.string().min(1, { message: "Municipality is required." }),
});

interface DonorFormProps {
  onSubmit: (data: DonorFormType) => void;
  initialData?: Partial<DonorFormType>;
  isLoading?: boolean;
}

export default function DonorForm({
  onSubmit,
  initialData = {},
  isLoading = false,
}: DonorFormProps) {
  const form = useForm<DonorFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || "",
      blood_group: initialData.blood_group || "",
      phone: initialData.phone || "",
      province: initialData.province || "",
      district: initialData.district || "",
      municipality: initialData.municipality || "",
    },
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const [districts, setDistricts] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);

  useEffect(() => {
    const province = form.getValues("province");
    if (province && locationData[province]) {
      setDistricts(Object.keys(locationData[province]));
    } else {
      setDistricts([]);
    }
    setMunicipalities([]);
  }, [form.watch("province")]);

  useEffect(() => {
    const province = form.getValues("province");
    const district = form.getValues("district");
    if (province && district && locationData[province]?.[district]) {
      setMunicipalities(locationData[province][district]);
    } else {
      setMunicipalities([]);
    }
  }, [form.watch("district")]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Donor Name"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Blood Group */}
          <FormField
            control={form.control}
            name="blood_group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Group</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="9812345678"
                    {...field}
                    value={field.value.replace("+977", "")} // show without +977
                    onChange={(e) => {
                      const localNumber = e.target.value.replace(/\D/g, ""); // remove non-digits
                      field.onChange(`+977${localNumber}`); // always save with +977
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Province */}
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(locationData).map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* District */}
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>District</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading || districts.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Municipality */}
          <FormField
            control={form.control}
            name="municipality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Municipality</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading || municipalities.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Municipality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {municipalities.map((municipality) => (
                      <SelectItem key={municipality} value={municipality}>
                        {municipality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="bg-rakta-600 hover:bg-rakta-700"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Donor"}
        </Button>
      </form>
    </Form>
  );
}
