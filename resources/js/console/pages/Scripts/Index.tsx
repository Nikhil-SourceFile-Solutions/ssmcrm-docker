import React, { useEffect, useState } from 'react';
import PageLoader from '../../components/Layouts/PageLoader';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import AddOrUpdate from './AddOrUpdate';
import Swal from 'sweetalert2';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
interface Script {
    id: string;
    name: string;
    script: string;
    status: number;
}

export default function Index() {
    const { logout, crmToken, apiUrl } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [scripts, setScripts] = useState<Script[]>([]);
    const [modal, setModal] = useState(false);
    const [script, setScript] = useState<Script | null>(null);

    const fetchScripts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/scripts`, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${crmToken}`,
                },
            });

            if (response.data.status === "success") {
                setScripts(response.data.scripts);
            } else {
                console.error("Failed to fetch scripts");
            }
        } catch (error) {
            console.error("Error fetching scripts:", error);

        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchScripts();
    }, []);

    const destroy = (script: Script) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`${apiUrl}/api/scripts/${script.id}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${crmToken}`,
                        },
                    });
                    if (response.data.status === "success") {
                        fetchScripts();
                    } else {
                        console.error("Failed to delete script");
                    }
                } catch (error) {
                    console.error("Error deleting script:", error);
                }
            }
        });
    };

    return (
        <>
            <div className='panel'>
                <div className='flex justify-between mb-4'>
                    <h1 className='font-extrabold text-[18px]'>Scripts & Meta Tags</h1>
                    <button className='btn btn-gradient' onClick={() => {
                        setScript(null);
                        setModal(true);
                    }}>Add Script</button>
                </div>

                {isLoading ? <PageLoader /> : (
                    <div className="table-responsive mb-5">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Script</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scripts.map((script) => (
                                    <tr key={script.id}>
                                        <td>
                                            <div className="whitespace-nowrap">{script.name}</div>
                                        </td>
                                        <td>{script.status === 1 ? 'Active' : 'Blocked'}</td>
                                        <td>{script.script}</td>
                                        <td className="text-end">
                                            <div className='flex gap-3 justify-end'>
                                                <button onClick={() => {
                                                    setScript(script);
                                                    setModal(true);
                                                }} aria-label={`Edit ${script.name}`}><FaEdit size={20} color='orange' /></button>

                                                <button onClick={() => destroy(script)} aria-label={`Delete ${script.name}`}><MdDelete color='red' size={20} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AddOrUpdate modal={modal} setModal={setModal} fetchScripts={fetchScripts} script={script} />
        </>
    );
}
