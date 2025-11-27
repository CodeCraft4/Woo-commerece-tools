import { supabase } from "../supabase/supabase";

// Fetch all cards from the database
export const fetchAllCardsFromDB = async () => {
  const { data, error } = await supabase.from("cards").select("*");
  if (error) throw new Error(error.message);
  return data;
};

// Fetch all Categories from Subapase.
export const fetchAllCategoriesFromDB = async () => {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw new Error(error.message);
  return data;
};

// Fetch All card Length
export const fetchCardCount = async () => {
  const { count, error } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true });

  if (error) throw new Error(error.message);
  return count;
};


// Fetch all Orders from DB.
export const fetchAllOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};


// Fetch all Orders Length.
export const fetchOrderCount = async () => {
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  if (error) throw new Error(error.message);
  return count;
};


// Fetch All Blogs from Db
export const fetchAllBlogs = async () => {
    const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching blogs:", error);
        return [];
    }

    return data || [];
};

// Delete Blogs by Id from DB
export const deleteBlog = async (id: string) => {
  const { error } = await supabase.from("blogs").delete().eq("id", id);

  if (error) throw new Error(error.message);
  return true;
};
