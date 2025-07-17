import { createSlice } from '@reduxjs/toolkit';
import i18next from 'i18next';
import themeConfig from '../theme.config';

let settingData = localStorage.getItem('settingData');
if (settingData) {
    settingData = JSON.parse(settingData)
    const x = document.querySelectorAll('.favicon-icon');
    x.forEach((y: any) => {
        y.href = themeConfig.apiUrl + '/storage/' + settingData?.favicon;
    });
}

const defaultState = {
    isDarkMode: false,
    mainLayout: 'app',
    theme: 'light',
    menu: 'horizontal',
    layout: 'full',
    rtlClass: 'ltr',
    animation: '',
    navbar: 'navbar-sticky',
    locale: 'en',
    sidebar: false,
    pageTitle: '',
    languageList: [
        { code: 'zh', name: 'Chinese' },
        { code: 'da', name: 'Danish' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'el', name: 'Greek' },
        { code: 'hu', name: 'Hungarian' },
        { code: 'it', name: 'Italian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'pl', name: 'Polish' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'es', name: 'Spanish' },
        { code: 'sv', name: 'Swedish' },
        { code: 'tr', name: 'Turkish' },
    ],
    semidark: false,
    crmToken: '',
    pin: '',
    authUser: null,
    lastLogin: null,
    settingTap: 'general',
    settingData: null,
    // invoiceSettingData:null,
    leadAlert: false,
    moveLeadData: null,
    emplyeeData: null,
    chatMessage: null,
    hideCols: ['id', 'email', 'second_phone', 'invest', 'free_trial', 'followup', 'dnd', 'city', 'first_trial', 'products', 'desc', 'kyc_status', 'rp_status', 'created_at', 'updated_at'],
    hideSaleCols: ['id', 'bank', 'client_paid', 'client_type', 'description', 'due_date', 'email', 'first_name',
        'last_name', 'offer_price', 'owner', 'phone', 'created_at', 'updated_at'],
    leadRequestCount: 0,

    callBacktData: [],

    broadcast: {},
    branches: [],
    selectedBranch: 0,
    dataForViewLead: {},
    documentAlets: {},
    crmVersion: 0,

};

const initialState = {

    theme: localStorage.getItem('theme') || themeConfig.theme,

    menu: 'horizontal',
    layout: localStorage.getItem('layout') || themeConfig.layout,
    rtlClass: localStorage.getItem('rtlClass') || themeConfig.rtlClass,
    animation: localStorage.getItem('animation') || themeConfig.animation,
    navbar: localStorage.getItem('navbar') || themeConfig.navbar,
    locale: localStorage.getItem('i18nextLng') || themeConfig.locale,
    isDarkMode: false,
    sidebar: localStorage.getItem('sidebar') || defaultState.sidebar,
    semidark: localStorage.getItem('semidark') || themeConfig.semidark,
    documentAlets: null,
    languageList: [
        { code: 'zh', name: 'Chinese' },
        { code: 'da', name: 'Danish' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'el', name: 'Greek' },
        { code: 'hu', name: 'Hungarian' },
        { code: 'it', name: 'Italian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'pl', name: 'Polish' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'es', name: 'Spanish' },
        { code: 'sv', name: 'Swedish' },
        { code: 'tr', name: 'Turkish' },
        { code: 'ae', name: 'Arabic' },
    ],

    crmToken: localStorage.getItem('crmToken') || defaultState.crmToken,
    pin: localStorage.getItem('pin') || defaultState.pin,


    settingTap: localStorage.getItem('settingTap') || defaultState.settingTap,

    authUser: JSON.parse(localStorage.getItem('authUser')) || themeConfig.authUser || themeConfig.authUser,
    lastLogin: JSON.parse(localStorage.getItem('lastLogin')) || themeConfig.lastLogin || themeConfig.lastLogin,
    hideCols: JSON.parse(localStorage.getItem('hideCols')) || defaultState.hideCols || defaultState.hideCols,
    leadAlert: localStorage.getItem('leadAlert') || defaultState.leadAlert,
    settingData: JSON.parse(localStorage.getItem('settingData')) || themeConfig.settingData || themeConfig.settingData,
    // invoiceSettingData: JSON.parse(localStorage.getItem('invoiceSettingData')) || themeConfig.invoiceSettingData || themeConfig.invoiceSettingData,



    // employeeData: JSON.parse(localStorage.getItem('employeeData')) || themeConfig.employeeData || themeConfig.employeeData,

    moveLeadData: themeConfig.moveLeadData,
    chatMessage: themeConfig.moveLeadData,
    callBacktData: JSON.parse(localStorage.getItem('callBacktData')) || defaultState.callBacktData || defaultState.callBacktData,

    apiUrl: themeConfig.apiUrl,
    leadRequestCount: localStorage.getItem('leadRequestCount') || defaultState.leadRequestCount,
    broadcast: JSON.parse(localStorage.getItem('broadcast')) || defaultState.broadcast,
    branches: JSON.parse(localStorage.getItem('branches')) || defaultState.branches || defaultState.branches,

    selectedBranch: localStorage.getItem('selectedBranch') || defaultState.selectedBranch,
    dataForViewLead: localStorage.getItem('dataForViewLead') || defaultState.dataForViewLead,
    crmVersion: localStorage.getItem('crmVersion') || defaultState.crmVersion,
};


const themeConfigSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        toggleTheme(state, { payload }) {
            payload = payload || state.theme; // light | dark | system
            localStorage.setItem('theme', payload);
            state.theme = payload;
            if (payload === 'light') {
                state.isDarkMode = false;
            } else if (payload === 'dark') {
                state.isDarkMode = true;
            } else if (payload === 'system') {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    state.isDarkMode = true;
                } else {
                    state.isDarkMode = false;
                }
            }

            if (state.isDarkMode) {
                document.querySelector('body')?.classList.add('dark');
            } else {
                document.querySelector('body')?.classList.remove('dark');
            }
        },
        toggleMenu(state, { payload }) {
            payload = 'horizontal'; // vertical, collapsible-vertical, horizontal
            state.sidebar = false; // reset sidebar state
            localStorage.setItem('menu', 'horizontal');
            state.menu = 'horizontal';
        },
        toggleLayout(state, { payload }) {
            payload = payload || state.layout; // full, boxed-layout
            localStorage.setItem('layout', payload);
            state.layout = payload;
        },
        toggleRTL(state, { payload }) {
            payload = payload || state.rtlClass; // rtl, ltr
            localStorage.setItem('rtlClass', payload);
            state.rtlClass = payload;
            document.querySelector('html')?.setAttribute('dir', state.rtlClass || 'ltr');
        },
        toggleAnimation(state, { payload }) {
            payload = payload || state.animation; // animate__fadeIn, animate__fadeInDown, animate__fadeInUp, animate__fadeInLeft, animate__fadeInRight, animate__slideInDown, animate__slideInLeft, animate__slideInRight, animate__zoomIn
            payload = payload?.trim();
            localStorage.setItem('animation', payload);
            state.animation = payload;
        },
        toggleNavbar(state, { payload }) {
            payload = payload || state.navbar; // navbar-sticky, navbar-floating, navbar-static
            localStorage.setItem('navbar', payload);
            state.navbar = payload;
        },
        toggleSemidark(state, { payload }) {
            payload = payload === true || payload === 'true' ? true : false;
            localStorage.setItem('semidark', payload);
            state.semidark = payload;
        },
        toggleLocale(state, { payload }) {
            payload = payload || state.locale;
            i18next.changeLanguage(payload);
            state.locale = payload;
        },
        toggleSidebar(state) {
            state.sidebar = !state.sidebar;
        },

        setPageTitle(state, { payload }) {
            document.title = `${payload} | Sourcefile CRM`;
        },
        setCrmToken(state, { payload }) {
            localStorage.setItem('crmToken', payload);
            state.crmToken = payload;
        },
        setPin(state, { payload }) {
            localStorage.setItem('pin', payload);
            state.pin = payload;
        },
        setAuthUser(state, { payload }) {
            localStorage.setItem('authUser', JSON.stringify(payload));
            state.authUser = payload;
        },
        setLastLogin(state, { payload }) {
            localStorage.setItem('lastLogin', payload);
            state.lastLogin = payload;
        },

        setHideCols(state, { payload }) {
            localStorage.setItem('hideCols', JSON.stringify(payload));
            state.hideCols = payload;
        },

        setSettingTap(state, { payload }) {
            localStorage.setItem('settingTap', payload);
            state.settingTap = payload;
        },

        setLeadAlert(state, { payload }) {
            localStorage.setItem('leadAlert', payload);
            state.leadAlert = payload;
        },

        setDocumentAlets(state, { payload }) {
            state.documentAlets = payload;
        },



        setSettingToggleData(state, { payload }) {
            localStorage.setItem('settingData', JSON.stringify(payload));
            state.settingData = payload;
            const x = document.querySelectorAll('.favicon-icon');
            x.forEach((y: any) => {
                y.href = themeConfig.apiUrl + '/storage/' + payload.favicon;
            });
        },
        // setInvoiceSettingData(state, { payload }) {
        //     localStorage.setItem('invoiceSettingData', JSON.stringify(payload));
        //     state.invoiceSettingData = payload;
        //     // const x = document.querySelectorAll('.favicon-icon');
        //     // x.forEach((y: any) => {
        //     //     y.href = themeConfig.apiUrl + '/storage/' + payload.favicon;
        //     // });
        // },

        // setEmployeeData(state, { payload }) {
        //     localStorage.setItem('employeeData', JSON.stringify(payload));
        //     state.employeeData = payload;
        // },

        setMoveLeadData(state, { payload }) {
            // localStorage.setItem('moveLeadData', JSON.stringify(payload));
            state.moveLeadData = payload;
        },

        setChatMessage(state, { payload }) {
            // localStorage.setItem('moveLeadData', );
            state.chatMessage = JSON.parse(payload.message);
        },

        setLeadRequestCount(state, { payload }) {
            localStorage.setItem('localStorage', payload);
            state.leadRequestCount = JSON.parse(payload);
        },

        setCallBacktData(state, { payload }) {
            localStorage.setItem('callBacktData', JSON.stringify(payload));
            state.callBacktData = payload;
        },


        setBroadcast(state, { payload }) {


            localStorage.setItem('broadcast', payload);
            state.broadcast = JSON.parse(payload);
        },
        setBranches(state, { payload }) {
            localStorage.setItem('branches', JSON.stringify(payload));
            state.branches = payload;
        },

        setSelectedBranch(state, { payload }) {
            localStorage.setItem('selectedBranch', payload);
            state.selectedBranch = payload;
        },


        setDataForViewLead(state, { payload }) {
            localStorage.setItem('dataForViewLead', payload);
            state.dataForViewLead = payload;
        },

        setCrmVersion(state, { payload }) {
            localStorage.setItem('crmVersion', payload);
            state.crmVersion = payload;
        },


        // leadRequestCount: localStorage.getItem('leadRequestCount') || defaultState.leadRequestCount
    },
});

export const { setCrmVersion, setDocumentAlets, setDataForViewLead, setSelectedBranch, setBranches, setCallBacktData, setBroadcast, setLeadRequestCount, setPin, setLastLogin, setChatMessage, setMoveLeadData, setSettingToggleData, setLeadAlert, setSettingTap, setHideCols, setAuthUser, setCrmToken, toggleTheme, toggleMenu, toggleLayout, toggleRTL, toggleAnimation, toggleNavbar, toggleSemidark, toggleLocale, toggleSidebar, setPageTitle } = themeConfigSlice.actions;

export default themeConfigSlice.reducer;
