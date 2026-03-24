import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { API_BASE, getImageUrl } from "../config/api";
import PublicLayout from "../components/layout/PublicLayout";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get("category");

  // States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(categoryId ? "products" : "categories");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  useEffect(() => {
    if (categoryId) {
      fetchProducts(categoryId);
      fetchCategoryName(categoryId);
      setView("products");
    } else {
      fetchCategories();
      setView("categories");
    }
  }, [categoryId]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (catId) => {
    setLoading(true);
    try {
      const url = catId
        ? `${API_BASE}/products?category=${catId}`
        : `${API_BASE}/products`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryName = async (catId) => {
    try {
      // Optimization: if we already have categories, find it there
      if (categories.length > 0) {
        const cat = categories.find((c) => c.category_id == catId);
        if (cat) setSelectedCategoryName(cat.category_name);
        return;
      }
      // Otherwise fetch all (simplified for now, ideally an endpoint for single category)
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      const cat = data.find((c) => c.category_id == catId);
      if (cat) setSelectedCategoryName(cat.category_name);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
        {/* Header / Breadcrumbs */}
        <div className="flex items-center gap-4 mb-8">
          {view === "products" && (
            <button
              onClick={() => navigate("/shop")}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            {view === "categories"
              ? "Shop Collections"
              : selectedCategoryName || "Products"}
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : view === "categories" ? (
          // CATEGORIES GRID
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <div
                key={cat.category_id}
                onClick={() => navigate(`/shop?category=${cat.category_id}`)}
                className="group cursor-pointer relative overflow-hidden rounded-2xl shadow-md h-80"
              >
                <img
                  src={getImageUrl(cat.image_path)}
                  alt={cat.category_name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x400?text=No+Image";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {cat.category_name}
                  </h3>
                  <p className="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                    {cat.description || "Explore our latest collection"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : // PRODUCTS GRID
        products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Filter size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl">No products found in this category.</p>
            <button
              onClick={() => navigate("/shop")}
              className="mt-4 text-blue-600 font-semibold hover:underline"
            >
              Browse other categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.product_id}
                onClick={() => navigate(`/product/${product.product_id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100"
              >
                <div className="h-64 overflow-hidden relative bg-gray-50">
                  <img
                    src={getImageUrl(product.image_path)}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x400?text=No+Image";
                    }}
                  />
                  {/* Quick Add Overlay (Optional) */}
                  <div className="absolute inset-x-0 bottom-0 bg-white/90 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3 text-center">
                    <span className="text-sm font-semibold text-gray-900">
                      View Details
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1 truncate">
                    {product.product_name}
                  </h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-gray-900">
                      Rs. {product.base_price?.toLocaleString()}
                    </span>
                    {product.stock_quantity > 0 ? (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default Shop;
