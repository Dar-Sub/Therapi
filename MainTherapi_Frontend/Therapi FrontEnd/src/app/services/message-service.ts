import { Injectable, Injector, ApplicationRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { MessagePopupComponent } from '../shared/message-popup/message-popup.component';

@Injectable({
    providedIn: 'root',
})
export class PopupService {
    private popupComponentRef!: ComponentRef<MessagePopupComponent>;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector
    ) { }

    /**
     * Opens the popup with the given parameters.
     */
    openPopup(
        title: string,
        message: string,
        actionText: string = '',
        icon: string | null = null
    ): void {
        // If a popup is already open, close it first
        if (this.popupComponentRef) {
            this.closePopup();
        }

        // Create a component factory for MessagePopupComponent
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(MessagePopupComponent);

        // Create the component reference
        this.popupComponentRef = componentFactory.create(this.injector);

        // Set the inputs
        this.popupComponentRef.instance.title = title;
        this.popupComponentRef.instance.message = message;
        this.popupComponentRef.instance.actionText = actionText;
        this.popupComponentRef.instance.icon = icon;
        this.popupComponentRef.instance.visible = true;

        // Listen for the close event
        this.popupComponentRef.instance.onClose.subscribe(() => this.closePopup());

        // Attach the component to the Angular app
        this.appRef.attachView(this.popupComponentRef.hostView);

        // Add the popup to the DOM
        const domElem = (this.popupComponentRef.hostView as any).rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);
    }

    /**
     * Closes the popup and destroys the component.
     */
    closePopup(): void {
        if (this.popupComponentRef) {
            this.appRef.detachView(this.popupComponentRef.hostView);
            this.popupComponentRef.destroy();
            this.popupComponentRef = null!;
        }
    }
}
