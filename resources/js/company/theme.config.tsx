const themeConfig = {
    locale: 'en', // en, da, de, el, es, fr, hu, it, ja, pl, pt, ru, sv, tr, zh
    theme: 'light', // light, dark, system
    menu: 'horizontal', // vertical, collapsible-vertical, horizontal
    layout: 'full', // full, boxed-layout
    rtlClass: 'ltr', // rtl, ltr
    animation: '', // animate__fadeIn, animate__fadeInDown, animate__fadeInUp, animate__fadeInLeft, animate__fadeInRight, animate__slideInDown, animate__slideInLeft, animate__slideInRight, animate__zoomIn
    navbar: 'navbar-sticky', // navbar-sticky, navbar-floating, navbar-static
    semidark: false,
    employeeData: null,
    crmToken: '',
    authUser: null,
    lastLogin: null,
    settingTap: 'general',
    leadAlert: false,
    settingData: { logo: '', favicon: '' },
    // invoiceSettingData:"jjjjj",

    apiUrl: window.location.origin
    // apiUrl: 'http://192.168.1.11:8000'   //Domain or IP only ex: http://127.0.0.1:8000   http:www.website.com  Note:- Don't '/' at end
    // apiUrl: 'https://tradingwealth.finsap.in/endpoint'   //Domain or IP only ex: http://127.0.0.1:8000   http:www.website.com  Note:- Don't '/' at end
    // apiUrl: 'https://srresearch.finsap.in/endpoint'   //Domain or IP only ex: http://127.0.0.1:8000   http:www.website.com  Note:- Don't '/' at end
    // apiUrl: 'https://dr.finsap.in/endpoint'   //Domain or IP only ex: http://127.0.0.1:8000   http:www.website.com  Note:- Don't '/' at end
    // apiUrl: 'https://finnovest.finsap.in/endpoint'   //Domain or IP only ex: http://127.0.0.1:8000   http:www.website.com  Note:- Don't '/' at end
};

export default themeConfig;
