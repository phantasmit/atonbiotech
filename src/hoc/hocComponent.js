import React, { PureComponent } from "react";
//
const HOCComponent = WrappedComponent => {
    //
    class Wrapped extends PureComponent {

        render() {
            const { children, ...props } = this.props;
            return (
                <>
                    <WrappedComponent {...props} style={{ flex: 1, backgroundColor: 'transparent', }}>
                        {children}
                    </WrappedComponent>
                </>
            )
        }
    }
    return Wrapped;
};

export default HOCComponent;