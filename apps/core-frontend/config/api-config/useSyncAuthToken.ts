"use client";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setAuthToken } from "./authTokenStore";

export const useSyncAuthToken = () => {
  const { getToken, isSignedIn, userId } = useAuth();

  useEffect(() => {
    const updateToken = async () => {
      if (isSignedIn && userId) {
        try {
          console.log('🔐 Getting Clerk token for user:', userId);

          // 🎯 PRIORITIZE JWT TEMPLATE TOKEN
          console.log('🎯 Attempting to get jwt template token...');
          
          let primaryToken: string | null = null;
          let fallbackToken: string | null = null;

          // Try to get jwt template token first
          try {
            primaryToken = await getToken({ template: "add_token_template_name" });
            console.log('✅ jwt token obtained:', !!primaryToken);
          } catch (error) {
            console.warn('⚠️ Failed to get jwt token:', error);
          }

          // Get default token as fallback
          try {
            fallbackToken = await getToken();
            console.log('📝 Fallback default token obtained:', !!fallbackToken);
          } catch (error) {
            console.warn('⚠️ Failed to get default token:', error);
          }

          // Use jwt token if available, otherwise fallback
          if (primaryToken) {
            console.log('🎉 Using jwt template token');
            setAuthToken(primaryToken);
          } else if (fallbackToken) {
            console.log('🔄 Using fallback default token');
            setAuthToken(fallbackToken);
          } else {
            console.error('❌ No tokens available');
            setAuthToken(null);
          }

        } catch (error) {
          console.error('❌ Error in token sync flow:', error);
          setAuthToken(null);
        }
      } else {
        console.log('🔐 User not signed in or no userId');
        setAuthToken(null);
      }
    };

    updateToken();

    const interval = setInterval(updateToken, 10000 * 60 * 5); // Refresh every 5 min
    return () => clearInterval(interval);
  }, [getToken, isSignedIn, userId]);
};
