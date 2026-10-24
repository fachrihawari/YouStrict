import { ComponentRef, ReactNode, Ref } from 'react';
import { Pressable, PressableProps, View } from 'react-native';
import { useResolveClassNames } from 'uniwind';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  className?: string;
  // Focus styles are resolved here and applied through the style callback
  // (predates uniwind's `focus:` variant, which isn't yet verified on TV).
  focusClassName?: string;
  children: ReactNode | ((state: { focused: boolean }) => ReactNode);
  ref?: Ref<ComponentRef<typeof View>>;
};

export default function FocusButton({
  className,
  focusClassName = 'bg-blue-600 border-blue-600',
  children,
  ref,
  ...props
}: Props) {
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
}
