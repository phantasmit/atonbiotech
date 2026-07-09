import AddAppointmentModal from '../modal/AddAppointmentModal';
import DoctorProfileModal from '../modal/DoctorProfileModal';
//ErrorPopup
const ModalStack = (Stack) => {
    return (
        <Stack.Group
            screenOptions={{
                headerShown: false,
                presentation: 'transparentModal',
                gestureEnable: true
            }}
        >
            <Stack.Screen
                name="AddAppointment"
                component={AddAppointmentModal}
                options={{
                    //headerShown: false,
                    presentation: 'transparentModal',
                    animation: 'fade',
                    // animation: 'fade',
                    // animationEnabled: true,
                    // contentStyle: {
                    //     backgroundColor: 'rgba(0,0,0,0.7)'
                    // },
                    // gestureEnabled: true,
                }} />
            <Stack.Screen
                name="DoctorProfile"
                component={DoctorProfileModal}
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                }} />



        </Stack.Group>
    )
}

export { ModalStack };