import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Plus, Settings, BarChart3 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#14B8A6',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarLabelStyle: {
                    fontWeight: '600',
                    fontSize: 11,
                    letterSpacing: -0.2,
                },
                tabBarStyle: {
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: Platform.OS === 'ios' ? 88 : 68,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                    paddingTop: 8,
                    backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#FFFFFFEE',
                },
                tabBarBackground: () =>
                    Platform.OS === 'ios' ? (
                        <BlurView
                            intensity={80}
                            tint="light"
                            style={{
                                ...StyleSheet.absoluteFillObject,
                                borderTopWidth: 0.5,
                                borderTopColor: 'rgba(255,255,255,0.2)',
                            }}
                        />
                    ) : (
                        <View
                            style={{
                                ...StyleSheet.absoluteFillObject,
                                backgroundColor: '#FFFFFFEE',
                                borderTopWidth: 0.5,
                                borderTopColor: '#E2E8F0',
                            }}
                        />
                    ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Today',
                    tabBarIcon: ({ color, size }) => (
                        <Home size={size} color={color} strokeWidth={2} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: 'Stats',
                    tabBarIcon: ({ color, size }) => (
                        <BarChart3 size={size} color={color} strokeWidth={2} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Settings size={size} color={color} strokeWidth={2} />
                    ),
                }}
            />
        </Tabs>
    );
}
