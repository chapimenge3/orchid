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