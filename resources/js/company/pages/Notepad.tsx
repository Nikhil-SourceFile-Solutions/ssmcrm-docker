import PerfectScrollbar from 'react-perfect-scrollbar';
import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import Dropdown from '../components/Dropdown';
import { setCrmToken, setPageTitle } from '../store/themeConfigSlice';
import IconNotes from '../components/Icon/IconNotes';
import IconNotesEdit from '../components/Icon/IconNotesEdit';
import IconStar from '../components/Icon/IconStar';
import IconSquareRotated from '../components/Icon/IconSquareRotated';
import IconPlus from '../components/Icon/IconPlus';
import IconMenu from '../components/Icon/IconMenu';
import IconPencil from '../components/Icon/IconPencil';
import IconTrashLines from '../components/Icon/IconTrashLines';
import IconX from '../components/Icon/IconX';
import axios from 'axios';
import IconHorizontalDots from '../components/Icon/IconHorizontalDots';

import IconEye from '../components/Icon/IconEye';
import { useAuth } from '../AuthContext';
import PageLoader from '../components/Layouts/PageLoader';
import { FiEdit, FiEdit2 } from 'react-icons/fi';
import { BsEye, BsEyeFill } from 'react-icons/bs';
import { useToast } from '../ToastContext ';
const Notepad = () => {


    const { apiUrl, crmToken, logout } = useAuth();
    const { addToast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [filterTag, setFilterTag] = useState('');
    const [filterFavourite, setFilterFavourite] = useState(0);
    const [notes, setNotes] = useState([]);
    const fetchNotes = async () => {

        console.log("Fetching Notes.....")
        setIsLoading(true);
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/notepads',
                params: {
                    filterTag: filterTag,
                    filterFavourite: filterFavourite,
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setNotes(response.data.notes)
            }

        } catch (error) {
            if (error?.response?.status == 401) logout()

        } finally {

            setIsLoading(false)
        }
    }
    useEffect(() => {
        fetchNotes();
    }, [filterFavourite, filterTag])

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Notes'));
    });

    const [addContactModal, setAddContactModal] = useState<any>(false);
    const [isShowNoteMenu, setIsShowNoteMenu] = useState<any>(false);
    const [isViewNoteModal, setIsViewNoteModal] = useState<any>(false);




    const [defaultParams] = useState({
        id: '',
        title: '',
        tag: '',
        description: '',
        is_favourite: 0
    });

    const [params, setParams] = useState<any>(defaultParams);

    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.title) {
            errors = { ...errors, title: "title is required" };
        }
        if (!params.description) {
            errors = { ...errors, description: "Description is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };

    const AddOrUpdateNote = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/notepads",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });



            if (response.data.status == 'success') {
                const note = response.data.note;
                if (response.data.action == 'update') {
                    const newNotes = [...notes],
                        index = notes.findIndex((n: any) => n.id == note.id);
                    newNotes[index] = { ...note, is_favourite: note.is_favourite == 1 ? 1 : 0 }
                    setNotes(newNotes)
                } else if (response.data.action == 'add') {
                    const newNotes = [{ ...note, is_favourite: note.is_favourite == 1 ? 1 : 0 }, ...notes];
                    setNotes(newNotes)

                }

                addToast({
                    variant: 'success',
                    title: response.data.message,
                });
                setAddContactModal(false)
            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            if (error?.response?.status == 401) logout()
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                }
                setErros(serverErrors);
                addToast({
                    variant: 'error',
                    title: error.response.data.message,
                });

            }
        } finally {
            setBtnLoading(false)
        }
    };


    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) {

            addToast({
                variant: 'error',
                title: 'Validation Error! Please Solve',
            });
            return false;
        }
        const data = new FormData();
        data.append("id", params.id);
        data.append("title", params.title);
        data.append("tag", params.tag);
        data.append("description", params.description);
        data.append("is_favourite", params.is_favourite);
        AddOrUpdateNote(data);
    };



    const UpdateDropdown = (data: any) => {
        setErros({});
        if (data) {
            setParams({
                id: data.id,
                title: data.title,
                tag: data.tag,
                description: data.description,
                is_favourite: data.is_favourite,
            });
        } else setParams(defaultParams)
        setAddContactModal(true)
    }



    const distroy = (note: any) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then(async (result) => {
            if (result.value) {
                try {
                    const response = await axios({
                        method: 'delete',
                        url: apiUrl + '/api/notepads/' + note.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {
                        setNotes(notes.filter((n: any) => n.id != note.id))

                        addToast({
                            variant: 'success',
                            title: response.data.message,
                        });
                    }

                }
                catch (error) {
                    if (error?.response?.status == 401) logout()
                }
                finally {

                }
            }
        });

    }

    const handleFav = (note) => {
        const data = new FormData();
        data.append("id", note.id);
        data.append("title", note.title);
        data.append("tag", note.tag);
        data.append("description", note.description);
        data.append("is_favourite", note.is_favourite ? 0 : 1);
        AddOrUpdateNote(data);
    }


    const handleTag = (note, tag) => {
        const data = new FormData();
        data.append("id", note.id);
        data.append("title", note.title);
        data.append("tag", tag);
        data.append("description", note.description);
        data.append("is_favourite", note.is_favourite);
        AddOrUpdateNote(data);
    }

    return (
        <div>
            <div className="flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full">
                <div className={`bg-black/60 z-10 w-full h-full rounded-md absolute hidden ${isShowNoteMenu ? '!block xl:!hidden' : ''}`} onClick={() => setIsShowNoteMenu(!isShowNoteMenu)}></div>
                <div
                    className={`panel
                    p-4
                    flex-none
                    w-[240px]
                    absolute
                    xl:relative
                    z-10
                    space-y-4
                    h-full
                    xl:h-auto
                    hidden
                    xl:block
                    ltr:lg:rounded-r-md ltr:rounded-r-none
                    rtl:lg:rounded-l-md rtl:rounded-l-none
                    overflow-hidden ${isShowNoteMenu ? '!block h-full ltr:left-0 rtl:right-0' : 'hidden shadow'}`}
                >
                    <div className="flex flex-col h-full pb-16">
                        <div className="flex text-center items-center">
                            <div className="shrink-0">
                                <IconNotes />
                            </div>
                            <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Notes</h3>
                        </div>


                        <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b] my-4"></div>
                        <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10
                                         ${!filterFavourite && 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]'
                                        }`}
                                    onClick={() => setFilterFavourite(0)}
                                >
                                    <div className="flex items-center">
                                        <IconNotesEdit className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">All Notes</div>
                                    </div>
                                </button>


                                <button
                                    type="button"
                                    className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10
                                        ${filterFavourite && 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]'
                                        }`}
                                    onClick={() => setFilterFavourite(1)}
                                >
                                    <div className="flex items-center">
                                        <IconStar className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Favourites</div>
                                    </div>
                                </button>


                                <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                <div className="px-1 py-3 text-white-dark">Tags</div>


                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-dark ltr:hover:pl-3 rtl:hover:pr-3 duration-300
                                        ${!filterTag && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                        }`}
                                    onClick={() => setFilterTag('')}
                                >
                                    <IconSquareRotated className="fill-primary shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3 dark:text-[#bfc9d4]">All Tags</div>
                                </button>


                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-primary ltr:hover:pl-3 rtl:hover:pr-3 duration-300
                                        ${filterTag === 'personal' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                        }`}
                                    onClick={() => setFilterTag('personal')}
                                >
                                    <IconSquareRotated className="fill-primary shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Personal</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-warning ltr:hover:pl-3 rtl:hover:pr-3 duration-300
                                        ${filterTag === 'work' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                        }`}
                                    onClick={() => setFilterTag('work')}
                                >
                                    <IconSquareRotated className="fill-warning shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Work</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-info ltr:hover:pl-3 rtl:hover:pr-3 duration-300
                                        ${filterTag === 'social' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                        }`}
                                    onClick={() => setFilterTag('social')}
                                >
                                    <IconSquareRotated className="fill-info shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Social</div>
                                </button>
                                <button
                                    type="button"
                                    className={`w-full flex items-center h-10 p-1 hover:bg-white-dark/10 rounded-md dark:hover:bg-[#181F32] font-medium text-danger ltr:hover:pl-3 rtl:hover:pr-3 duration-300
                                        ${filterTag === 'important' && 'ltr:pl-3 rtl:pr-3 bg-gray-100 dark:bg-[#181F32]'
                                        }`}
                                    onClick={() => setFilterTag('important')}
                                >
                                    <IconSquareRotated className="fill-danger shrink-0" />
                                    <div className="ltr:ml-3 rtl:mr-3">Important</div>
                                </button>
                            </div>
                        </PerfectScrollbar>
                    </div>
                    <div className="ltr:left-0 rtl:right-0 absolute bottom-0 p-4 w-full">
                        <button className="btn btn-primary w-full" type="button" onClick={() => UpdateDropdown(null)}>
                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 shrink-0" />
                            Add New Note
                        </button>
                    </div>
                </div>
                <div className="panel flex-1 overflow-auto h-full">
                    <div className="pb-5">
                        <button type="button" className="xl:hidden hover:text-primary" onClick={() => setIsShowNoteMenu(!isShowNoteMenu)}>
                            <IconMenu />
                        </button>
                    </div>



                    {isLoading ? <PageLoader /> : (
                        <>



                            {notes.length ? (
                                <div className="sm:min-h-[300px] min-h-[400px]">
                                    <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
                                        {notes.map((note: any) => {
                                            return (
                                                <div
                                                    className={`panel pb-12 ${note.tag === 'personal'
                                                        ? 'bg-primary-light shadow-primary'
                                                        : note.tag === 'work'
                                                            ? 'bg-warning-light shadow-warning'
                                                            : note.tag === 'social'
                                                                ? 'bg-info-light shadow-info'
                                                                : note.tag === 'important'
                                                                    ? 'bg-danger-light shadow-danger'
                                                                    : 'dark:shadow-dark'
                                                        }`}
                                                    key={note.id}
                                                >
                                                    <div className="min-h-[100px]">
                                                        <div className="flex justify-between">
                                                            <div className="flex items-center w-max">

                                                                <div className="ltr:ml-2 rtl:mr-2">
                                                                    <div className="font-semibold">{note.title}</div>
                                                                    <div className="text-xs font-bold text-white-dark">{note.created_at}</div>
                                                                </div>
                                                            </div>

                                                            {note.description.length > 120 ? (<button onClick={() => {
                                                                setParams(note); setIsViewNoteModal(true)
                                                            }}>
                                                                <BsEyeFill size={20} />
                                                            </button>) : null}

                                                        </div>

                                                        <div className='mt-3'>
                                                            <p> {note.description.length > 120 ? note.description.substring(0, 120) + '...' : note.description}</p>
                                                        </div>

                                                    </div>
                                                    <div className="absolute bottom-5 left-0 w-full px-5">
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="dropdown fdfdf">
                                                                <Dropdown
                                                                    offset={[0, 5]}
                                                                    placement='bottom-start'
                                                                    btnClassName={`${note.tag === 'personal'
                                                                        ? 'text-primary'
                                                                        : note.tag === 'work'
                                                                            ? 'text-warning'
                                                                            : note.tag === 'social'
                                                                                ? 'text-info'
                                                                                : note.tag === 'important'
                                                                                    ? 'text-danger'
                                                                                    : ''
                                                                        }`}
                                                                    button={
                                                                        <span>
                                                                            <IconSquareRotated
                                                                                className={
                                                                                    note.tag === 'personal'
                                                                                        ? 'fill-primary'
                                                                                        : note.tag === 'work'
                                                                                            ? 'fill-warning'
                                                                                            : note.tag === 'social'
                                                                                                ? 'fill-info'
                                                                                                : note.tag === 'important'
                                                                                                    ? 'fill-danger'
                                                                                                    : ''
                                                                                }
                                                                            />
                                                                        </span>
                                                                    }
                                                                >
                                                                    <ul className="text-sm font-medium">
                                                                        <li>
                                                                            <button type="button" onClick={() => handleTag(note, 'personal')}>
                                                                                <IconSquareRotated className="ltr:mr-2 rtl:ml-2 fill-primary text-primary" />
                                                                                Personal
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => handleTag(note, 'work')}>
                                                                                <IconSquareRotated className="ltr:mr-2 rtl:ml-2 fill-warning text-warning" />
                                                                                Work
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => handleTag(note, 'social')}>
                                                                                <IconSquareRotated className="ltr:mr-2 rtl:ml-2 fill-info text-info" />
                                                                                Social
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => handleTag(note, 'important')}>
                                                                                <IconSquareRotated className="ltr:mr-2 rtl:ml-2 fill-danger text-danger" />
                                                                                Important
                                                                            </button>
                                                                        </li>
                                                                    </ul>

                                                                </Dropdown>
                                                            </div>
                                                            <div className="flex items-center gap-2">

                                                                <button type="button" className="text-info" onClick={() => UpdateDropdown(note)}>
                                                                    <FiEdit />
                                                                </button>

                                                                <button type="button" className="text-warning  " onClick={() => handleFav(note)}>
                                                                    <IconStar className={`w-4.5 h-4.5 group-hover:fill-warning ${note.is_favourite && 'fill-warning'}`} />
                                                                </button>
                                                                <button type="button" className="text-danger" onClick={() => distroy(note)}>
                                                                    <IconTrashLines />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center sm:min-h-[300px] min-h-[400px] font-semibold text-lg h-full">No data available</div>
                            )}
                        </>
                    )}



                    <Transition appear show={addContactModal} as={Fragment}>
                        <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-[51]">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0 bg-[black]/60" />
                            </Transition.Child>

                            <div className="fixed inset-0 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center px-4 py-8">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                            <button
                                                type="button"
                                                onClick={() => setAddContactModal(false)}
                                                className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                            >
                                                <IconX />
                                            </button>
                                            <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                                {params.id ? 'Edit Note' : 'Add Note'}
                                            </div>
                                            <div className="p-5">
                                                <form>
                                                    <div className="mb-5">
                                                        <label htmlFor="title">Title</label>
                                                        <input name="title" type="text" placeholder="Enter Title" className="form-input" value={params.title} onChange={(e) => changeValue(e)} />
                                                        <div className="text-danger mt-1">{errors.title}</div>
                                                    </div>

                                                    <div className="mb-5">
                                                        <label htmlFor="tag">Tag</label>
                                                        <select name="tag" className="form-select" value={params.tag} onChange={(e) => changeValue(e)}>
                                                            <option value="">None</option>
                                                            <option value="personal">Personal</option>
                                                            <option value="work">Work</option>
                                                            <option value="social">Social</option>
                                                            <option value="important">Important</option>
                                                        </select>
                                                        <div className="text-danger mt-1">{errors.tag}</div>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="desc">Description</label>
                                                        <textarea
                                                            name="description"
                                                            rows={3}
                                                            className="form-textarea resize-none min-h-[130px]"
                                                            placeholder="Enter Description"
                                                            value={params.description}
                                                            onChange={(e) => changeValue(e)}
                                                        ></textarea>
                                                        <div className="text-danger mt-1">{errors.description}</div>
                                                    </div>
                                                    <div className="flex justify-end items-center mt-8">
                                                        <button type="button" className="btn btn-outline-danger gap-2" onClick={() => setAddContactModal(false)}>
                                                            Cancel
                                                        </button>
                                                        <button type="button" disabled={btnLoading} className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => formSubmit()}>
                                                            {btnLoading ? 'Please Wait...' : params.id ? 'Update Note' : 'Add Note'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>



                    <Transition appear show={isViewNoteModal} as={Fragment}>
                        <Dialog as="div" open={isViewNoteModal} onClose={() => setIsViewNoteModal(false)} className="relative z-[51]">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0 bg-[black]/60" />
                            </Transition.Child>

                            <div className="fixed inset-0 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center px-4 py-8">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                            <button
                                                type="button"
                                                onClick={() => setIsViewNoteModal(false)}
                                                className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                            >
                                                <IconX />
                                            </button>
                                            <div className="flex items-center flex-wrap gap-2 text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                                <div className="ltr:mr-3 rtl:ml-3">{params.title}</div>
                                                {params.tag && (
                                                    <button
                                                        type="button"
                                                        className={`badge badge-outline-primary rounded-3xl capitalize ltr:mr-3 rtl:ml-3 ${(params.tag === 'personal' && 'shadow-primary',
                                                            params.tag === 'work' && 'shadow-warning',
                                                            params.tag === 'social' && 'shadow-info',
                                                            params.tag === 'important' && 'shadow-danger')
                                                            }`}
                                                    >
                                                        {params.tag}
                                                    </button>
                                                )}
                                                {params.isFav && (
                                                    <button type="button" className="text-warning">
                                                        <IconStar className="fill-warning" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <div className="text-base">{params.description}</div>

                                                <div className="ltr:text-right rtl:text-left mt-8">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setIsViewNoteModal(false)}>
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>
                </div>
            </div>
        </div>
    );
};

export default Notepad;


