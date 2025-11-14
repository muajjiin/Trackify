import { useCallback, useState } from "react";
import { Alert } from "react-native";
const API_URL = "http://localhost:5001/api";
export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactiosns = useCallback(async () => {
    try {
      const respons = await fetch(`${API_URL}/transactions/${userId}`);
      const data = await respons.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error data fetch transactions", error);
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/summary/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch summary");
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      await Promise.all([fetchTransactiosns(), fetchSummary()]);
    } catch (error) {
      console.error("Error data loading", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSummary, fetchTransactiosns, userId]);

  const deleteTransaction = async (id) => {
    try {
      const respons = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
      });
      if (!respons.ok) throw new Error("Failed to  delete Transactions");

      loadData();
      Alert.alert("Success", "Transactions  deleted Successfully");
    } catch (error) {
      console.log("Error deleting transactions:", error);
      Alert.alert("Error", error.message);
    }
  };

  return { transactions, summary, loadData, isLoading, deleteTransaction };
};
