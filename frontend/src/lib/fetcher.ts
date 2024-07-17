import useSWR from 'swr';


const BASE_URL = "http://localhost:8000";

export function fetcher(url: string, requestInit?: RequestInit) {
    return fetch(url, requestInit).then((res) => res.json())
}

export function useTasks(params: URLSearchParams | string) {
    const url = new URL(`${BASE_URL}/api/v1/tasks/`);
    url.search = params.toString();
    return useSWR(url.toString(), fetcher);
}

export function useTask(taskId: string) {
    return useSWR(`${BASE_URL}/api/v1/tasks/${taskId}/`, fetcher);
}

export function useTaksRetry(taskId: string) {
    return useSWR(`${BASE_URL}/api/v1/tasks/${taskId}/retry/`, fetcher);
}

export function useRegisterTask() {
    return useSWR(`${BASE_URL}/api/v1/tasks/registered-tasks/`, fetcher);
}

export async function invokeTask(taskName: string, payload: string) {
    try {
        const parameter = payload ? JSON.parse(payload) : null;
        const body = {
            task_name: taskName,
            args: parameter?.args,
            kwargs: parameter?.kwargs,
        };
        const response = await fetch(`${BASE_URL}/api/v1/tasks/invoke/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        // Handle error
        console.error(error);
        throw error;
    }
}

export async function revokeTask(taskId: string) {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/tasks/${taskId}/revoke/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        // Handle error
        console.error(error);
        throw error;
    }
}