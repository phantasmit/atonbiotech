import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerStack } from "./drawerStack";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ModalStack } from "./modalStack";
import { UpdateProfileComponent } from "../screens/updateProfile/updateProfileComponent";
import { UpdateDoctorComponent } from "../screens/updateDoctor/updateDoctorComponent";
import { MedicineListComponent } from "../screens/medicineList/medicineListComponent";
import { MyProfileComponent } from "../screens/profile/myProfileComponent";
import { AddDoctorComponent } from "../screens/addDoctor/addDoctorComponent";
import { AddCategoryComponent } from "../screens/category/addCategoryComponent";
import { ProductComponent } from "../screens/product/productComponent";
import { ProductDetailComponent } from "../screens/productDetail/productDetailComponent";
import { AssignProductList } from '../screens/assignProductList/assignProductList';
import { FavoriteComponent } from '../screens/favorite/favoriteComponent';
import { OfferComponent } from '../screens/offers/offerComponent';
import { ContactUsComponent } from '../screens/contactUs/contactUsComponent';
import { WebPageComponent } from '../screens/webPage/webPageComponent';
import { UpdatePasswordComponent } from '../screens/updatePassword/updatePasswordComponent';
//
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

//
const AppStack = () => {
    return (
        // <Drawer.Navigator
        //     headerMode="none"
        //     //initialRouteName="Tabs"
        //     openByDefault={false}
        //     screenOptions={{
        //         drawerType: 'front',
        //         headerShown: false,
        //         gestureEnabled: true,
        //         swipeEnabled: true,
        //         drawerPosition: 'left',
        //         drawerStyle: {
        //             overlayColor: "rgba(0 ,0 ,0, 0.5)",
        //             width: Dimensions.get('window').width / 3,
        //             backgroundColor: '#3C94FF'
        //         },
        //     }}
        //   //
        // >

        //     <Drawer.Screen name="Tabs" component={() => {
        //         return (
        //             <Stack.Navigator
        //                 screenOptions={{
        //                     headerShown: false,
        //                     cardStyle: { backgroundColor: '#fff' },
        //                 }}
        //             >
        //                 <Stack.Screen name="TabsRoot" component={Tabs} />

        //             </Stack.Navigator>
        //         )
        //     }} />


        // </Drawer.Navigator>
        <Stack.Navigator
            hideNavbar={true}
            initialRouteName="drawer"
            screenOptions={{
                headerShown: false,
                gestureEnabled: false,
                cardStyle: { backgroundColor: 'transparent' },
                cardOverlayEnabled: true,
            }}
        >
            <Stack.Group
                screenOptions={{
                    headerShown: false,
                    gestureEnable: true,
                }}
            >

                <Stack.Screen name="drawer" component={DrawerStack} />
                <Stack.Screen name="updateProfile" component={UpdateProfileComponent} />
                <Stack.Screen name="updateDoctor" component={UpdateDoctorComponent} />
                <Stack.Screen name="medicineList" component={MedicineListComponent} />
                <Stack.Screen name="myProfile" component={MyProfileComponent} />
                <Stack.Screen name="addDoctor" component={AddDoctorComponent} />
                <Stack.Screen name="addCategory" component={AddCategoryComponent} />
                <Stack.Screen name="product" component={ProductComponent} />
                <Stack.Screen name="productDetail" component={ProductDetailComponent} />
                <Stack.Screen name="assignProductList" component={AssignProductList} />
                <Stack.Screen name="favorite" component={FavoriteComponent} />
                <Stack.Screen name="offers" component={OfferComponent} />
                <Stack.Screen name="contactUs" component={ContactUsComponent} />
                <Stack.Screen name="webPage" component={WebPageComponent} />
                <Stack.Screen name="updatePassword" component={UpdatePasswordComponent} />
            </Stack.Group>
            {
                ModalStack(Stack)
            }
        </Stack.Navigator>
    )
}

export { AppStack };