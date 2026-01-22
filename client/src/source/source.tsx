import { supabase } from "../supabase/supabase";
import { toast } from 'react-hot-toast';

// Fetch all cards from the database
export const fetchAllCardsFromDB = async () => {
  const { data, error } = await supabase.from("cards").select("*");
  if (error) throw new Error(error.message);
  return data;
};

// Fetch all Categories from Subapase.
// src/source/source.ts
export const fetchAllCategoriesFromDB = async () => {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw new Error(error.message);

  return (data ?? []).slice().sort((a: any, b: any) =>
    String(a?.name ?? "").localeCompare(String(b?.name ?? ""), undefined, {
      sensitivity: "base",
      numeric: true,
    })
  );
};


// Fetch All card Length
export const fetchCardCount = async () => {
  const { count, error } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true });

  if (error) throw new Error(error.message);
  return count;
};


export const fetchAllUsersFromDB = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from("Users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []);
};

export const deleteUserById = async (id: number | string) => {
  const { error } = await supabase.from("Users").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return id;
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


// user orders 
export async function fetchMyOrders() {
  // ✅ get logged-in user (client-side)
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);

  const user = userRes?.user;
  if (!user?.id) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,user_id,session_id,payer_name,payer_email,currency,amount,status,preview_image,created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []);
}


// Fetch All Blogs from Db
export const fetchAllBlogs = async () => {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    toast.error("Error fetching blogs:");
    return [];
  }

  return data || [];
};

export async function fetchBlogByParam(param: string): Promise<any | null> {
  if (!param) return null;

  // 1) If numeric: query by numeric id
  const isNumeric = /^[0-9]+$/.test(param);

  if (isNumeric) {
    const numericId = Number(param);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", numericId)
      .single();

    if (!error && data) return data;
    // if not found, fall through and try as slug/uuid just in case
  }

  // 2) Try id as string (uuid/text)
  {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", param)
      .single();

    if (!error && data) return data;
  }

  // 3) Try slug (recommended to have a unique index on blogs.slug)
  {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("slug", param)
      .single();

    if (!error && data) return data;
  }

  return null;
}

export const fetchAllTempletDesigns = async () => {
  const { data, error } = await supabase
    .from("templetDesign")
    .select("*")

  if (error) {
    console.error("Supabase error:", {
      message: error.message,
      details: (error as any).details,
      hint: (error as any).hint,
      code: (error as any).code,
    });
    throw error;
  }

  return data ?? [];
};

export const fetchAllTempletDesignsLight = async () => {
  const PAGE_SIZE = 20; // light rows pe 20/30 theek
  let from = 0;
  const out: any[] = [];

  while (true) {
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("templetDesign")
      .select(`
        id,
        img_url,
        category,
        title,
        description,
        actualprice,
        saleprice,
        a4price,
        a5price,
        a3price,
        usletter,
        halfusletter,
        ustabloid,
        salea4price,
        salea5price,
        salea3price,
        saleusletter,
        salehalfusletter,
        saleustabloid
      `)
      .range(from, to);

    if (error) throw error;

    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return out;
};


export const fetchTempletCardCount = async () => {
  const { count, error } = await supabase
    .from("templetDesign")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
};

export const fetchTempletDesignById = async (id: string) => {
  const { data, error } = await supabase
    .from("templetDesign")
    .select("id, category, raw_stores, created_at")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

// ✅ Jab need ho tab (open/preview) raw_stores lao
export const fetchTempletRawStoresById = async (id: string | number) => {
  const { data, error } = await supabase
    .from("templetDesign")
    .select("id, raw_stores")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};



// Blogs-----------------------------
export async function saveBlog({
  title,
  content_html,
  meta = {},
}: {
  title: string;
  content_html: string;
  meta?: any['meta'];
}) {
  if (!title?.trim()) throw new Error('Title is required');
  if (!content_html?.trim()) throw new Error('HTML content is required');

  const { data, error } = await supabase
    .from('blogs')
    .insert([{ title, content_html, meta }])
    .select()
    .single();
  if (error) throw error;
  toast.success("Blogs is Added")
  return data;
}

// glue for your component
export async function submitBlog({
  title,
  html,
  meta,
}: {
  title: string;
  html: string;
  meta: { fontFamily?: string; defaultFontPx?: number; color?: string };
}) {
  return saveBlog({ title, content_html: html, meta });
}

export async function updateBlog(id: string, input: {
  title: string;
  content_html: string;
  meta?: any['meta'];
}): Promise<any> {
  const { data, error } = await supabase
    .from('blogs')
    .update({ title: input.title, content_html: input.content_html, meta: input.meta ?? {} })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBlog(id: string): Promise<void> {
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchBlogById(id: string): Promise<any> {
  if (!id || typeof id !== 'string') throw new Error('fetchBlogById: id is required');

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // why: surface "not found" or SQL errors clearly
    throw new Error(error.message || 'Failed to fetch blog');
  }
  return data;
}


// For Video Toturial Adding
export async function saveTutorial(input: any): Promise<any> {
  const { data, error } = await supabase.from('tutorials').insert([input]).select().single();
  toast.success("Toturial is save successfully")
  if (error) throw new Error(error.message || 'Failed to save tutorial');
  return data;
}

/** Update */
export async function updateTutorial(id: string, input: any): Promise<any> {
  const { data, error } = await supabase
    .from('tutorials')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  toast.success("Updated Toturial is Successfully ")
  if (error) throw new Error(error.message || 'Failed to update tutorial');
  return data as any;
}

/** Delete */
export async function deleteTutorial(id: string): Promise<void> {
  const { error } = await supabase.from('tutorials').delete().eq('id', id);
  if (error) throw new Error(error.message || 'Failed to delete tutorial');
}

// (Optional) fetchAll
export async function fetchAllTutorials(): Promise<any[]> {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message || 'Failed to fetch tutorials');
  return (data ?? []) as any[];
}

export async function fileToBase64Url(file: File): Promise<string> {
  return await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}
