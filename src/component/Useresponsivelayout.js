// import { useMemo } from 'react';
// import { useWindowDimensions } from 'react-native';

// // Shorter-edge breakpoint used to decide "tablet vs phone", so it stays
// // correct regardless of orientation (a tablet is still a tablet whether
// // held portrait or landscape).
// export const TABLET_BREAKPOINT = 600;

// /**
//  * Scales a base font size relative to a 375pt-wide reference (roughly a
//  * standard small phone) so text grows sensibly on tablets and shrinks
//  * sensibly on very small phones, without ever going too extreme.
//  */
// export const scaleFont = (size, referenceWidth) => {
//     const ratio = referenceWidth / 375;
//     const clampedRatio = Math.min(Math.max(ratio, 0.85), 1.6);
//     return Math.round(size * clampedRatio);
// };

// /**
//  * useResponsiveLayout
//  * --------------------
//  * Central hook for screen-level responsive decisions: tablet vs phone,
//  * portrait vs landscape, and a set of derived sizing values (box
//  * dimensions, font sizes, icon/image sizes, spacing).
//  *
//  * Re-runs automatically on rotation/resize because it's driven by
//  * useWindowDimensions.
//  *
//  * All sizing can be overridden per-screen via `options`, so a screen
//  * that needs a narrower box, larger icons, etc. doesn't have to
//  * duplicate the tablet/orientation logic — it just overrides the
//  * relevant slice of output.
//  *
//  * @param {object} [options]
//  * @param {number} [options.tabletBreakpoint] - shorter-edge px threshold for "tablet"
//  * @param {object} [options.boxWidth] - { tabletLandscape, tabletPortrait, phoneLandscape, phonePortrait }
//  * @param {object} [options.boxHeight] - same shape as boxWidth
//  * @param {number} [options.titleFontSize] - base title font size (scaled)
//  * @param {number} [options.bodyFontSize] - base body font size (scaled)
//  * @param {object} [options.iconSize] - { tablet, phone }
//  * @param {object} [options.imageSize] - { tablet, phone }
//  * @param {object} [options.gap] - { tablet, phone }
//  * @param {object} [options.horizontalPadding] - { tablet, phone }
//  *
//  * @returns {{
//  *   width: number,
//  *   height: number,
//  *   isLandscape: boolean,
//  *   isTablet: boolean,
//  *   useSplitLayout: boolean,
//  *   boxWidth: string,
//  *   boxHeight: string,
//  *   titleSize: number,
//  *   bodySize: number,
//  *   iconSize: number,
//  *   imageSize: number,
//  *   gap: number,
//  *   horizontalPadding: number,
//  * }}
//  */
// export const useResponsiveLayout = (options = {}) => {
//     const { width, height } = useWindowDimensions();

//     const {
//         tabletBreakpoint = TABLET_BREAKPOINT,
//         boxWidth: boxWidthOpt = {
//             tabletLandscape: '70%',
//             tabletPortrait: '75%',
//             phoneLandscape: '85%',
//             phonePortrait: '90%',
//         },
//         boxHeight: boxHeightOpt = {
//             tabletLandscape: '80%',
//             tabletPortrait: '60%',
//             phoneLandscape: '72%',
//             phonePortrait: '65%',
//         },
//         titleFontSize = 18,
//         bodyFontSize = 14,
//         iconSize: iconSizeOpt = { tablet: 20, phone: 16 },
//         imageSize: imageSizeOpt = { tablet: 140, phone: 160 },
//         gap: gapOpt = { tablet: 24, phone: 12 },
//         horizontalPadding: paddingOpt = { tablet: 32, phone: 16 },
//     } = options;

//     return useMemo(() => {
//         const isLandscape = width > height;
//         const shorterSide = Math.min(width, height);
//         const isTablet = shorterSide >= tabletBreakpoint;

//         // Split-pane layout (e.g. branding beside a form) whenever there's
//         // enough horizontal room to justify it: any landscape orientation,
//         // or a tablet even in portrait.
//         const useSplitLayout = isLandscape || isTablet;

//         let boxWidth;
//         let boxHeight;
//         if (isTablet && isLandscape) {
//             boxWidth = boxWidthOpt.tabletLandscape;
//             boxHeight = boxHeightOpt.tabletLandscape;
//         } else if (isTablet && !isLandscape) {
//             boxWidth = boxWidthOpt.tabletPortrait;
//             boxHeight = boxHeightOpt.tabletPortrait;
//         } else if (!isTablet && isLandscape) {
//             boxWidth = boxWidthOpt.phoneLandscape;
//             boxHeight = boxHeightOpt.phoneLandscape;
//         } else {
//             boxWidth = boxWidthOpt.phonePortrait;
//             boxHeight = boxHeightOpt.phonePortrait;
//         }

//         return {
//             width,
//             height,
//             isLandscape,
//             isTablet,
//             useSplitLayout,
//             boxWidth,
//             boxHeight,
//             titleSize: scaleFont(titleFontSize, shorterSide),
//             bodySize: scaleFont(bodyFontSize, shorterSide),
//             iconSize: isTablet ? iconSizeOpt.tablet : iconSizeOpt.phone,
//             imageSize: isTablet ? imageSizeOpt.tablet : imageSizeOpt.phone,
//             gap: isTablet ? gapOpt.tablet : gapOpt.phone,
//             horizontalPadding: isTablet ? paddingOpt.tablet : paddingOpt.phone,
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [width, height]);
// };

// export default useResponsiveLayout;


import { useWindowDimensions } from 'react-native';

/**
 * ----------------------------------------------------------------------
 * useResponsiveLayout
 *
 * Central breakpoint logic for auth screens (Login, Registration,
 * Forgot Password). Re-evaluates on rotation/resize via
 * useWindowDimensions.
 *
 * Key decision: `useSplitLayout` (branding pane beside form pane,
 * side-by-side) only turns on when there's enough WIDTH *and* enough
 * HEIGHT to support two columns comfortably — tablets/iPads in either
 * orientation, or a phone specifically in landscape with real width.
 * Plain portrait phones always stack vertically.
 * ----------------------------------------------------------------------
 */
export function useResponsiveLayout() {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const shortestSide = Math.min(width, height);
    const isTablet = shortestSide >= 600;

    const useSplitLayout = isTablet || (isLandscape && width >= 700);

    // Card width: comfortable margins on phones, capped so it doesn't
    // stretch uncomfortably wide on large tablets/iPads.
    const boxWidth = isTablet ? Math.min(width * 0.82, 880) : Math.min(width - 32, 480);

    const horizontalPadding = isTablet ? 32 : 20;
    const gap = isTablet ? 20 : 14;

    // Landscape phones have very little vertical room — shrink the logo
    // and title so nothing gets clipped or forces excessive scrolling.
    const imageSize = isTablet ? 88 : isLandscape ? 52 : 76;
    const titleSize = isTablet ? 26 : isLandscape ? 18 : 22;
    const bodySize = isTablet ? 16 : 14;

    const cardPadding = isTablet ? 36 : isLandscape ? 20 : 26;
    const cardRadius = 20;

    return {
        width,
        height,
        isLandscape,
        isTablet,
        useSplitLayout,
        boxWidth,
        horizontalPadding,
        gap,
        imageSize,
        titleSize,
        bodySize,
        cardPadding,
        cardRadius,
    };
}