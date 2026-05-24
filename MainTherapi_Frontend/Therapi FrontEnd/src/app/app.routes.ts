import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './accounts/login/login.component';
import { SignUpComponent } from './accounts/sign-up/sign-up.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { ProfileComponent } from './shared/profile/profile.component';
import { AuthGuard } from './services/auth-guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'chat', component: ChatComponent, canActivate: [AuthGuard]  },
    { path: 'purchase', component: PurchaseComponent, canActivate: [AuthGuard]  },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]  },
    { path: '**', redirectTo: '/login' },
];
