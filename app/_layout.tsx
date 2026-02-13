import React, { useCallback, useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrizzleProvider } from '../db/client';
import { configureNotificationHandler, requestNotificationPermissions } from '../services/scheduler';
import { Toast } from '../components/toast';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// ── TanStack Query Client ────────────────────────────────
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,
            retry: 2,
        },
    },
});

export default function RootLayout() {
    useEffect(() => {
        // Configure notification handler
        configureNotificationHandler();
        // Request permissions on mount
        requestNotificationPermissions();
        // Hide splash screen
        SplashScreen.hideAsync();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <DrizzleProvider>
                    <StatusBar style="dark" />
                    <Stack
                        screenOptions={{
                            headerTransparent: true,
                            headerBlurEffect: 'regular',
                            headerStyle: { backgroundColor: 'transparent' },
                            headerTintColor: '#0F172A',
                            headerTitleStyle: {
                                fontWeight: '700',
                                letterSpacing: -0.5,
                            },
                            contentStyle: { backgroundColor: '#F8FAFC' },
                        }}
                    />
                    <Toast />
                </DrizzleProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
