import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { UserHomeComponent } from './components/user-home/user-home.component';
import { PublicListsComponent } from './components/public-lists/public-lists.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { SecurityPrivacyComponent } from './components/security-privacy/security-privacy.component';
import { AcceptableUsePolicyComponent } from './components/acceptable-use-policy/acceptable-use-policy.component';
import { DMCANoticeTakedownPolicyComponent } from './components/dmca-notice-takedown-policy/dmca-notice-takedown-policy.component';
import { MockEmailComponent } from './components/mock-email/mock-email.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

export const routes: Routes = [
    {path: '', component: UserHomeComponent },
    {path: 'login', component: LoginComponent},
    {path: 'userHome', component: UserHomeComponent },
    {path: 'publicLists', component: PublicListsComponent },
    {path: 'signUp', component: SignUpComponent },
    {path: 'securityPrivacy', component: SecurityPrivacyComponent},
    {path: 'acceptableUsePolicy', component: AcceptableUsePolicyComponent},
    {path: 'DMCANoticeTakedownPolicy', component: DMCANoticeTakedownPolicyComponent},
    {path: 'emailVerification', component: MockEmailComponent},
    {path: 'updatePassword', component: ChangePasswordComponent}
];


