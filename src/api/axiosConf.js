import axios from "axios";

export const apiURL = axios.create({
  baseURL: "https://akudera.pythonanywhere.com/api/",
});
