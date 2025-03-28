export function validate(data: string) {
    if(!data.trim()) {
        return "This field is required."
    }
    return null;
}