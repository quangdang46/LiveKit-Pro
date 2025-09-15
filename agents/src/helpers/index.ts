export const handleError = async <T>(
  operation: () => Promise<T>,
  onError?: (error: any) => void | Promise<void>,
  onFinally?: () => void | Promise<void>
): Promise<T | undefined> => {
  try {
    return await operation();
  } catch (error) {
    console.log("Handler error:", error);
    if (onError) {
      await onError(error);
    }
    return undefined;
  } finally {
    if (onFinally) {
      await onFinally();
    }
  }
};
