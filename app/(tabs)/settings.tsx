import React from 'react';
import { View, Text, Pressable, Platform, Switch } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { User, Moon, Bell, Shield, ChevronRight, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/ui-store';

export default function SettingsScreen() {
    const { isDarkMode, toggleDarkMode, userName } = useUIStore();

    const sections = [
        {
            title: 'Profile',
            items: [
                { label: 'Name', value: userName, icon: User, color: '#14B8A6' },
            ],
        },
        {
            title: 'Preferences',
            items: [
                { label: 'Dark Mode', icon: Moon, color: '#6366F1', isToggle: true, toggleValue: isDarkMode, onToggle: toggleDarkMode },
                { label: 'Notifications', icon: Bell, color: '#F97316', value: 'Enabled' },
            ],
        },
        {
            title: 'About',
            items: [
                { label: 'Privacy Policy', icon: Shield, color: '#10B981' },
                { label: 'Version', icon: Info, color: '#64748B', value: '1.0.0' },
            ],
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'ios' ? 100 : 80 }}>
            <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#0F172A', letterSpacing: -0.8 }}>
                    Settings
                </Text>
            </Animated.View>

            {sections.map((section, sIdx) => (
                <Animated.View
                    key={section.title}
                    entering={FadeInDown.delay(100 * sIdx).springify().damping(15)}
                    style={{ marginBottom: 24 }}
                >
                    <Text style={{
                        fontSize: 12, fontWeight: '700', color: '#94A3B8',
                        letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8,
                    }}>
                        {section.title}
                    </Text>
                    <View style={{
                        backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 20,
                        shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.06, shadowRadius: 12, elevation: 2, overflow: 'hidden',
                    }}>
                        {section.items.map((item, iIdx) => {
                            const Icon = item.icon;
                            return (
                                <Pressable
                                    key={item.label}
                                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16,
                                        borderBottomWidth: iIdx < section.items.length - 1 ? 0.5 : 0,
                                        borderBottomColor: '#F1F5F9',
                                    }}
                                >
                                    <View style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        backgroundColor: item.color + '15',
                                        alignItems: 'center', justifyContent: 'center', marginRight: 12,
                                    }}>
                                        <Icon size={18} color={item.color} strokeWidth={2} />
                                    </View>
                                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#0F172A' }}>
                                        {item.label}
                                    </Text>
                                    {(item as any).isToggle ? (
                                        <Switch
                                            value={(item as any).toggleValue}
                                            onValueChange={(item as any).onToggle}
                                            trackColor={{ false: '#E2E8F0', true: '#14B8A6' }}
                                            thumbColor="#FFF"
                                        />
                                    ) : (item as any).value ? (
                                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#94A3B8' }}>
                                            {(item as any).value}
                                        </Text>
                                    ) : (
                                        <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>
            ))}
        </View>
    );
}
