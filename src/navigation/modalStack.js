import AddAppointmentModal from '../modal/AddAppointmentModal';
import DoctorProfileModal from '../modal/DoctorProfileModal';
import AddLabel from '../modal/AddLabel';
import AssignProduct from '../modal/AssignProduct';
import ConfirmModal from '../modal/ConfirmModal';
import EditModal from '../modal/EditModal';
import EditAppointment from '../modal/EditAppointment';
import CancelReason from '../modal/CancelReason';
import EditDoctorModal from '../modal/EditDoctorModal'
//
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
            <Stack.Screen
                name="AddLabel"
                component={AddLabel}
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                }} />
            <Stack.Screen
                name="AssignProduct"
                component={AssignProduct}
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                }} />
            <Stack.Screen
                name="ConfirmModal"
                component={ConfirmModal}
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                }} />
            <Stack.Screen
                name="EditModal"
                component={EditModal}
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                }} />
            <Stack.Screen
                name="EditAppointment"
                component={EditAppointment}
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                }} />
            <Stack.Screen
                name="CancelReason"
                component={CancelReason}
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                }} />
            <Stack.Screen
                name="EditDoctorModal"
                component={EditDoctorModal}
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                }} />


        </Stack.Group>
    )
}

export { ModalStack };