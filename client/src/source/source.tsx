import { supabase } from "../supabase/supabase";

// Fetch all cards from the database
export  const fetchAllCardsFromDB = async () => {
  const { data, error } = await supabase.from("cards").select("*");
  console.log(data,'-')
  if (error) throw new Error(error.message);
  return data;
};

