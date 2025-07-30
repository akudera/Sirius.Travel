import { defineStore } from "pinia";
import { apiURL } from "../api/axiosConf";

export const usePlacesStore = defineStore("places", {
  state: () => ({
    places: [],
  }),
  actions: {
    async getPlaces(sorting = "") {
      const { data } = await apiURL.get(`/places?${sorting}`);
      this.places = data;
    },
    async getPlaceById(id) {
      try {
        const { data } = await apiURL.get(`/places/${id}`);
        return data;
      } catch (error) {
        console.error(`Ошибка при получении места с ID ${id}:`, error);
        throw error;
      }
    },
    async createPlace(name, address, categories, description, images) {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("address", address);
      formData.append("description", description);

      if (categories && categories.length) {
        categories.forEach((category) => {
          formData.append("category", category);
        });
      }

      if (images && images.length) {
        for (let i = 0; i < images.length; i++) {
          formData.append("images", images[i]);
        }
      }

      await apiURL.post("/places", formData);
    },
    async addComment(placeId, rating, description) {
      const response = await apiURL.post(`/places/${placeId}/reviews`, {
        rating,
        description,
      });
      return response.data;
    },
    formatCategory(category) {
      switch (category) {
        case "cafe":
          return "Кафе и рестораны";
        case "park":
          return "Парки и зоны отдыха";
        case "museum":
          return "Музеи и галереи";
        case "sport":
          return "Спортивные объекты";
        case "education":
          return "Образование";
        case "shop":
          return "Магазины";
        case "entertainment":
          return "Развлечения";
        case "hotel":
          return "Отели и проживание";
        default:
          return category;
      }
    },
  },
});
