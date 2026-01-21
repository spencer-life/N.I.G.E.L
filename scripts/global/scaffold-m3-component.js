#!/usr/bin/env node
/**
 * Scaffold Material Web (M3) Component
 * Usage: node scaffold-m3-component.js <ComponentName> [type]
 * Types: button, textfield, dialog, card, list
 */

const fs = require('fs');
const path = require('path');

const [,, componentName, componentType = 'generic'] = process.argv;

if (!componentName) {
    console.error('❌ Error: Component name required');
    console.log('Usage: node scaffold-m3-component.js <ComponentName> [type]');
    console.log('Types: button, textfield, dialog, card, list, generic');
    process.exit(1);
}

// Determine output directory
const componentsDir = fs.existsSync('src/components') 
    ? 'src/components' 
    : fs.existsSync('frontend/src/components')
    ? 'frontend/src/components'
    : 'components';

if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
}

const componentPath = path.join(componentsDir, `${componentName}.tsx`);

// Component templates based on type
const templates = {
    button: `import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';

interface ${componentName}Props {
    label: string;
    variant?: 'filled' | 'outlined';
    onClick?: () => void;
    disabled?: boolean;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
    label,
    variant = 'filled',
    onClick,
    disabled = false,
}) => {
    const Component = variant === 'filled' ? 'md-filled-button' : 'md-outlined-button';
    
    return (
        <Component
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </Component>
    );
};
`,

    textfield: `import '@material/web/textfield/outlined-text-field.js';

interface ${componentName}Props {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'email' | 'password' | 'number';
    required?: boolean;
    error?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    error,
}) => {
    return (
        <div className="textfield-wrapper">
            <md-outlined-text-field
                label={label}
                value={value}
                type={type}
                required={required}
                error={!!error}
                error-text={error}
                onInput={(e) => onChange((e.target as HTMLInputElement).value)}
            />
        </div>
    );
};
`,

    dialog: `import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-button.js';
import { useRef } from 'react';

interface ${componentName}Props {
    title: string;
    content: React.ReactNode;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
    title,
    content,
    onConfirm,
    onCancel,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
}) => {
    const dialogRef = useRef<HTMLElement>(null);
    
    const open = () => {
        (dialogRef.current as any)?.show();
    };
    
    const close = () => {
        (dialogRef.current as any)?.close();
    };
    
    const handleConfirm = () => {
        onConfirm?.();
        close();
    };
    
    const handleCancel = () => {
        onCancel?.();
        close();
    };
    
    return (
        <>
            <md-dialog ref={dialogRef}>
                <div slot="headline">{title}</div>
                <div slot="content">{content}</div>
                <div slot="actions">
                    <md-text-button onClick={handleCancel}>
                        {cancelLabel}
                    </md-text-button>
                    <md-filled-button onClick={handleConfirm}>
                        {confirmLabel}
                    </md-filled-button>
                </div>
            </md-dialog>
        </>
    );
};

// Export the open function for external use
${componentName}.displayName = '${componentName}';
`,

    card: `import '@material/web/elevation/elevation.js';

interface ${componentName}Props {
    title: string;
    description?: string;
    children?: React.ReactNode;
    onClick?: () => void;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
    title,
    description,
    children,
    onClick,
}) => {
    return (
        <div 
            className="m3-card" 
            onClick={onClick}
            style={{
                backgroundColor: 'var(--md-sys-color-surface)',
                color: 'var(--md-sys-color-on-surface)',
                borderRadius: 'var(--md-sys-shape-corner-large)',
                padding: '16px',
                cursor: onClick ? 'pointer' : 'default',
            }}
        >
            <md-elevation level={1} />
            <h3 style={{
                fontSize: 'var(--md-sys-typescale-headline-small-size)',
                fontWeight: 'var(--md-sys-typescale-headline-small-weight)',
                margin: '0 0 8px 0',
            }}>
                {title}
            </h3>
            {description && (
                <p style={{
                    fontSize: 'var(--md-sys-typescale-body-medium-size)',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    margin: '0 0 16px 0',
                }}>
                    {description}
                </p>
            )}
            {children}
        </div>
    );
};
`,

    list: `import '@material/web/list/list.js';
import '@material/web/list/list-item.js';

interface ListItem {
    id: string;
    headline: string;
    supportingText?: string;
    onClick?: () => void;
}

interface ${componentName}Props {
    items: ListItem[];
}

export const ${componentName}: React.FC<${componentName}Props> = ({ items }) => {
    return (
        <md-list>
            {items.map((item) => (
                <md-list-item
                    key={item.id}
                    headline={item.headline}
                    supportingText={item.supportingText}
                    onClick={item.onClick}
                />
            ))}
        </md-list>
    );
};
`,

    generic: `import '@material/web/button/filled-button.js';

interface ${componentName}Props {
    // Define your props here
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
    return (
        <div className="${componentName.toLowerCase()}">
            {/* Your Material Web components here */}
            <md-filled-button>
                ${componentName}
            </md-filled-button>
        </div>
    );
};
`
};

const template = templates[componentType] || templates.generic;

// Write component file
fs.writeFileSync(componentPath, template);

// Create styles file
const stylesPath = path.join(componentsDir, `${componentName}.css`);
const stylesContent = `/* ${componentName} Styles */

.${componentName.toLowerCase()} {
    /* Use Material Design tokens */
    --component-primary: var(--md-sys-color-primary);
    --component-surface: var(--md-sys-color-surface);
}

/* Example token usage */
.${componentName.toLowerCase()}__element {
    background-color: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    border-radius: var(--md-sys-shape-corner-medium);
    padding: 16px;
}
`;

fs.writeFileSync(stylesPath, stylesContent);

console.log('✨ Material Web Component created successfully!');
console.log('');
console.log(`📁 Files created:`);
console.log(`   ${componentPath}`);
console.log(`   ${stylesPath}`);
console.log('');
console.log('📝 Next steps:');
console.log(`   1. Import the component: import { ${componentName} } from './${componentsDir}/${componentName}';`);
console.log(`   2. Use it in your app: <${componentName} />`);
console.log('   3. Customize the styles in the CSS file');
console.log('');
console.log('📚 Reference: docs/MATERIAL-WEB-REFERENCE.md');
