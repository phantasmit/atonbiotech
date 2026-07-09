import { createMigrate } from 'redux-persist';
const migrations = {
    1: (state) => {
        return {
            ...state,
        };
    },
}


export default createMigrate(
    migrations,
    {
        debug: true,
    },
);