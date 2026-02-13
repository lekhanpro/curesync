import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
    progress: number;     // 0 to 1
    size?: number;
    strokeWidth?: number;
    color?: string;
    bgColor?: string;
    label?: string;
    sublabel?: string;
}

export function ProgressRing({
    progress,
    size = 160,
    strokeWidth = 12,
    color = '#14b8a6',
    bgColor = '#E2E8F0',
    label,
    sublabel,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(progress, {
            duration: 1200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
    }, [progress]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - animatedProgress.value),
    }));

    const displayPercent = useMemo(
        () => Math.round(progress * 100),
        [progress]
    );

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Animated progress circle */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            {/* Center text */}
            <View
                style={{
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text
                    style={{
                        fontSize: 36,
                        fontWeight: '800',
                        color: '#0F172A',
                        letterSpacing: -1,
                        fontVariant: ['tabular-nums'],
                    }}
                >
                    {displayPercent}%
                </Text>
                {label && (
                    <Text
                        style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: '#64748B',
                            marginTop: 2,
                        }}
                    >
                        {label}
                    </Text>
                )}
                {sublabel && (
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: '500',
                            color: '#94A3B8',
                            marginTop: 1,
                        }}
                    >
                        {sublabel}
                    </Text>
                )}
            </View>
        </View>
    );
}
