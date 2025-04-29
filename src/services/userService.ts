import { supabase } from "@/lib/supabaseClient";

export async function getAdminInfo() {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user?.id) {
    throw new Error("User not logged in");
  }

  const { data, error } = await supabase
    .from("users")
    .select(
      "full_name, phone, province, district, municipality, organization_name"
    )
    .eq("id", user.user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    orgName: data.organization_name,
    phone: data.phone,
    province: data.province,
    district: data.district,
    municipality: data.municipality,
  };
}
