// hooks/useCategories.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the shape of your API response
interface Category {
  id: string;
  poster: string;
  title: string;
}

interface CategoriesPage {
  data: Category[];
  nextPage: number | undefined; // This will tell TanStack Query if there are more pages
}

// Your API fetching function
// This needs to be a real API endpoint that supports pagination
const fetchCategories = async ({ pageParam = 0 }): Promise<CategoriesPage> => {
  // Replace this with your actual API call.
  // The API should return a subset of data and a way to get the next page.
  // Example: /api/categories?page=0&limit=10
  const response = await axios.get(
    `/api/categories?page=${pageParam}&limit=10`
  );
  
  // This is a mock for a real-world paginated API.
  // In a real API, `response.data` might contain a `nextPage` property.
  const allData: Category[] = response.data; // Assuming your API returns all data for now
  const limit = 10;
  const start = pageParam * limit;
  const end = start + limit;
  
  const pageData = allData.slice(start, end);
  const nextPage = end < allData.length ? pageParam + 1 : undefined;

  return { data: pageData, nextPage };
};

export const useCategories = () => {
  return useInfiniteQuery<CategoriesPage>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};