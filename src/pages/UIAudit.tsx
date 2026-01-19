import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Mail, Search, Save, Trash, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const UIAudit: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toggleLoading = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-[#BEAF87] mb-8">UI Component System Audit</h1>

            {/* Buttons Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Buttons</h2>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button leftIcon={Save}>Save Record</Button>
                    <Button rightIcon={Trash} variant="danger">Delete</Button>
                    <Button isLoading={isLoading} onClick={toggleLoading}>Click to Load</Button>
                    <Button disabled>Disabled</Button>
                </div>
            </section>

            {/* Inputs Section */}
            <section className="space-y-4 max-w-2xl">
                <h2 className="text-xl font-semibold border-b pb-2">Inputs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Default Input" placeholder="Type something..." />
                    <Input label="With Icon" leftIcon={Search} placeholder="Search..." />
                    <Input label="With Helper" helperText="This is a helpful hint" placeholder="Enter data" />
                    <Input label="Error State" error="This field is required" defaultValue="Invalid value" />
                    <Input label="Email" type="email" leftIcon={Mail} placeholder="john@example.com" />
                </div>
            </section>

            {/* Cards Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader 
                            title="Standard Card" 
                            subtitle="Subtitle description here" 
                            icon={Info}
                            action={<Button size="sm" variant="outline">Action</Button>}
                        />
                        <CardContent>
                            <p className="text-gray-600">This is distinct card content with standard padding.</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[#BEAF87]">
                        <CardContent>
                            <h3 className="font-bold text-lg mb-2">Simple Card</h3>
                            <p>A simple card without a distinct header block.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Modals Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Modals</h2>
                <Button onClick={() => setIsModalOpen(true)} variant="primary">Open Modal Demo</Button>
                
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    title="Confirmation Required"
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm Action</Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 rounded-lg flex gap-3 text-yellow-800">
                            <AlertTriangle className="shrink-0" />
                            <p className="text-sm">This is a warning inside the modal content.</p>
                        </div>
                        <p className="text-gray-600">
                            Are you sure you want to proceed with this action? This modal demonstrates the reusable dialog component with backdrop, centering, and focus management.
                        </p>
                    </div>
                </Modal>
            </section>
        </div>
    );
};

export default UIAudit;
