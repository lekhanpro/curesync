import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
    FadeInUp,
    FadeOutUp,
    Layout,
    SlideInUp,
    SlideOutUp
} from 'react-native-reanimated';
import { Check, AlertTriangle, Info, X } from 'lucide-react-native';
import { useUIStore } from '../store/ui-store';
import { Platform } from 'react-native';

const ICONS = {
    success: Check,
    error: AlertTriangle,
    info: Info,
};

const COLORS = {
    success: '#10B981',
    error: '#F43F5E',
    info: '#3B82F6',
};

const BG_COLORS = {
    success: '#ECFDF5',
    error: '#FFF1F2',
    info: '#EFF6FF',
};

export function Toast() {
    const { toast, hideToast } = useUIStore();

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                hideToast();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast, hideToast]);

    if (!toast) return null;

    const Icon = ICONS[toast.type];
    const color = COLORS[toast.type];
    const bgColor = BG_COLORS[toast.type];

    return (
        <Animated.View
            entering={SlideInUp.springify().damping(15)}
            exiting={SlideOutUp}
            layout={Layout.springify()}
            style={{
                position: 'absolute',
                top: Platform.OS === 'ios' ? 60 : 40,
                left: 20,
                right: 20,
                zIndex: 9999,
                alignItems: 'center',
            }}
        >
            <View
                style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                    borderWidth: 1,
                    borderColor: bgColor,
                    maxWidth: 500,
                    width: '100%',
                }}
            >
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: bgColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                    }}
                >
                    <Icon size={20} color={color} strokeWidth={2.5} />
                </View>

                <View style={{ flex: 1, marginRight: 8 }}>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#0F172A',
                            marginBottom: 2
                        }}
                    >
                        {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info'}
                    </Text>
                    <Text
                        style={{
                            fontSize: 13,
                            color: '#64748B',
                            fontWeight: '500'
                        }}
                    >
                        {toast.message}
                    </Text>
                </View>

                <Pressable
                    onPress={hideToast}
                    hitSlop={10}
                    style={{
                        padding: 4,
                        borderRadius: 8,
                        backgroundColor: '#F1F5F9',
                    }}
                >
                    <X size={14} color="#94A3B8" />
                </Pressable>
            </View>
        </Animated.View>
    );
}
