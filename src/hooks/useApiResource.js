import { useCallback, useEffect, useRef, useState } from 'react'

import { getApiErrorMessage } from '../api/client'

function useApiResource(fetcher, { enabled = true, initialData = null } = {}) {
  const mountedRef = useRef(false)
  const abortRef = useRef(null)
  const [data, setData] = useState(initialData)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [isRetrying, setIsRetrying] = useState(false)

  const execute = useCallback(
    async ({ retry = false } = {}) => {
      if (!enabled) {
        return null
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      if (retry) {
        setIsRetrying(true)
      } else {
        setIsLoading(true)
      }

      setError(null)

      try {
        const result = await fetcher({ signal: controller.signal })

        if (mountedRef.current && !controller.signal.aborted) {
          setData(result)
        }

        return result
      } catch (requestError) {
        if (controller.signal.aborted) {
          return null
        }

        if (mountedRef.current) {
          setError(getApiErrorMessage(requestError))
        }

        return null
      } finally {
        if (mountedRef.current && !controller.signal.aborted) {
          setIsLoading(false)
          setIsRetrying(false)
        }
      }
    },
    [enabled, fetcher],
  )

  useEffect(() => {
    mountedRef.current = true
    execute()

    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [execute])

  return {
    data,
    error,
    isLoading,
    isRetrying,
    retry: () => execute({ retry: true }),
    refetch: execute,
  }
}

export { useApiResource }
