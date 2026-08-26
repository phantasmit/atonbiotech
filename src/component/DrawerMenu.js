import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import fonts from '../assets/fonts/fonts';
import colors from '../assets/appColor/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import GradientIconBadge from './GradientIconBadge';


const DrawerMenu = (props) => {
    const { containerData = {}, onPress, iconData = {}, textData = {}, isSelected = false, imageViewStyle = {} } = props;
    const { backgroundType, containerBG, borderBG, isIcon } = containerData;
    const { iconName, iconColor } = iconData;
    const { title, textColor } = textData;
    const { width } = useWindowDimensions(); // re-renders on rotation/split-screen

    const isTabletWidth = width >= 600;

    const containerStyle =
        backgroundType == 3
            ? [styles.container, styles.backgroundBG(containerBG), styles.borderBG(borderBG)]
            : backgroundType == 2
                ? [styles.container, styles.backgroundBG(containerBG), { paddingVertical: 10 }]
                : [styles.container];

    return (
        <TouchableOpacity onPress={onPress} style={containerStyle} activeOpacity={0.7}>
            {/* <Icon name={iconName} size={isTabletWidth ? 18 : 16} color={iconColor} /> */}
            <GradientIconBadge
                colors={['transparent', 'transparent']}
                iconName={iconName}
                iconColor={iconColor}
                size={isTabletWidth ? 20 : 18}
                iconSize={isTabletWidth ? 18 : 16}
                borderRadius={0} />
            <Text
                style={[
                    styles.title,
                    { color: textColor, fontSize: isTabletWidth ? 14 : 13 },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {title}
            </Text>
            {(backgroundType == 3 && isIcon) && (
                <View>
                    {/* style={{ transform: [{ rotate: '0deg' }] }}*/}
                    <Icon
                        name={isSelected ? 'chevron-down' : 'chevron-right'}
                        size={isTabletWidth ? 14 : 12}
                        color={'#ABABAB'}
                    />
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '95%',
        marginVertical: 2,
        alignSelf: 'center',
        flexDirection: 'row',
        paddingVertical: 5,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: 8,
    },
    title: {
        flex: 1,
        fontFamily: fonts.POPPINS_REGULAR,
        fontWeight: '500',
        marginLeft: 10,
    },
    backgroundBG: (bgColor) => ({
        backgroundColor: bgColor,
    }),
    borderBG: (leftColor) => ({
        borderLeftWidth: 5,
        borderLeftColor: leftColor,
    }),
});

export default DrawerMenu;