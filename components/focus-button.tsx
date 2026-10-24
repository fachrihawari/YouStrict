import { ReactNode, forwardRef } from 'react';
import { Pressable, PressableProps, View } from 'react-native';
import { useResolveClassNames } from 'uniwind';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  className?: string;
  // uniwind 1.0.5 has no `focus:` variant on Pressable, so focus styles are
  // resolved here and applied through the style callback.
  focusClassName?: string;
  children: ReactNode | ((state: { focused: boolean }) => ReactNode);
};

const FocusButton = forwardRef<View, Props>(function FocusButton(
  { className, focusClassName = 'bg-blue-600 border-blue-600', children, ...props },
  ref,
) {
  const focusStyle = useResolveClassNames(focusClassName);

  return (
    <Pressable
      ref={ref}
      accessibilityRole='button'
      className={className}
      style={({ focused }) => (focused ? focusStyle : undefined)}
      {...props}
    >
      {({ focused }) => (typeof children === 'function' ? children({ focused }) : children)}
    </Pressable>
  );
});

export default FocusButton;
