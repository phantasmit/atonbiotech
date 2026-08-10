import { createMigrate } from 'redux-persist';
import stacks from "../navigation/stackEnum";

const migrations = {
    1: (state) => {
        return {
            ...state,
        };
    },
    2: (state) => {
        return {
            ...state,
            stack_name: stacks.ON_BOARD_STACK
        };
    },
    3: (state) => {
        return {
            ...state,
            doctorData: [],
            hospitalData: []
        };
    },
    4: (state) => {
        return {
            ...state,
            hospitalData: [],
            categoryData: [],
            labelData: [],
            loading: {
                category: false,
                hospitals: false,
                lables: false,
            },
            error: {
                category: null,
                hospitals: null,
                lables: null,
            }
        };
    },
}


export default createMigrate(
    migrations,
    {
        debug: true,
    },
);