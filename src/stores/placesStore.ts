import { defineStore } from "pinia";
import { apiURL } from "../api/axiosConf";
import type { TCategory } from "../types";
import type { IPlace, IReview } from "../interfaces";

type TTranslatedCategory =
  | "Кафе и рестораны"
  | "Парки и зоны отдыха"
  | "Музеи и галереи"
  | "Спортивные объекты"
  | "Образование"
  | "Магазины"
  | "Развлечения"
  | "Отели и проживание";
export const usePlacesStore = defineStore("places", {
  state: (): { places: IPlace[] } => ({
    places: [] as IPlace[],
  }),
  actions: {
    async getPlaces(sorting = ""): Promise<void> {
      const { data } = await apiURL.get<IPlace[]>(`/places?${sorting}`);
      this.places = data;
    },
    /**
     * @throws {Error}
     */
    async getPlaceById(id: string): Promise<IPlace> {
      try {
        const { data } = await apiURL.get<IPlace>(`/places/${id}`);
        return data;
      } catch (error) {
        console.error(`Ошибка при получении места с ID ${id}:`, error);
        throw error;
      }
    },
    async createPlace(
      name: string,
      address: string,
      categories: TCategory[],
      description: string,
      images: Blob[],
    ): Promise<void> {
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
          const image = images[i];
          if (!image) return;
          formData.append("images", image);
        }
      }

      await apiURL.post("/places", formData);
    },
    /**
     * @throws {AxiosError}
     */
    async addComment(
      placeId: string,
      rating: number,
      description: string,
    ): Promise<IReview> {
      try {
        const { data } = await apiURL.post<IReview>(
          `/places/${placeId}/reviews`,
          {
            rating,
            description,
          },
        );
        return data;
      } catch (error) {
        console.error(
          `Ошибка при добавлении комментария к месту с ID ${placeId}:`,
          error,
        );
        throw error;
      }
    },
    formatCategory(category: TCategory): TTranslatedCategory {
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
