import React, { PureComponent } from "react";
import {
    TouchableOpacity,
    Image,
    Text,
    View,
    StyleSheet,
    Pressable,
    Keyboard,
    useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome";
import colors from "../assets/appColor/colors";
import fonts from "../assets/fonts/fonts";

const HeaderComponent = WrappedComponent => {

    class Wrapped extends PureComponent {

        render() {
            const { children, ...props } = this.props;

            return (
                <ResponsiveHeader {...props}>
                    <WrappedComponent {...props}>
                        {children}
                    </WrappedComponent>
                </ResponsiveHeader>
            );
        }
    }

    return Wrapped;
};

const ResponsiveHeader = ({ children, onPress, isBack }) => {

    const { width } = useWindowDimensions();

    const isTablet = width >= 600;

    const headerHeight = isTablet ? 72 : 60;
    const horizontalPadding = isTablet ? 24 : 16;
    const iconSize = isTablet ? 28 : 22;
    const avatarSize = isTablet ? 46 : 38;
    const titleSize = isTablet ? 22 : 18;

    return (
        <>
            <View
                style={[
                    styles.shadowBox,
                    {
                        height: headerHeight,
                        paddingHorizontal: horizontalPadding,
                    },
                ]}
            >
                <TouchableOpacity onPress={onPress}>
                    <Icon
                        name={isBack ? "arrow-left" : "align-justify"}
                        size={iconSize}
                        color={colors.WHITE_COLOR}
                    />
                </TouchableOpacity>

                <Text
                    numberOfLines={1}
                    style={[
                        styles.title,
                        {
                            fontSize: titleSize,
                            marginLeft: horizontalPadding,
                        },
                    ]}
                >
                    Aton Biotech
                </Text>

                <View
                    style={[
                        styles.avatarContainer,
                        {
                            width: avatarSize,
                            height: avatarSize,
                            borderRadius: avatarSize / 2,
                        },
                    ]}
                >
                    <Image
                        source={{ uri: "" }}
                        style={{
                            width: avatarSize - 4,
                            height: avatarSize - 4,
                            borderRadius: (avatarSize - 4) / 2,
                        }}
                    />
                </View>
            </View>

            <View style={styles.container}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={Keyboard.dismiss}
                >
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        {children}
                    </GestureHandlerRootView>
                </Pressable>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    shadowBox: {
        backgroundColor: colors.ICON_COLOR_PRIMARY,
        flexDirection: "row",
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,

        elevation: 6,
    },

    title: {
        flex: 1,
        color: colors.WHITE_COLOR,
        fontWeight: "600",
        fontFamily: fonts.POPPINS_REGULAR,
    },

    avatarContainer: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.WHITE_COLOR,
        overflow: "hidden",
    },

    container: {
        flex: 1,
        backgroundColor: colors.WHITE_COLOR,
    },
});

export default HeaderComponent;