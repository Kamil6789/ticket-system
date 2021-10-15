<template>
    <header>
        <div class="container">
            <div class="header">
                <div class="header-content rounded shadow-lg p-3 mb-5">
                    <h1 class="h2">System zgłoszeń</h1>
                    <b-tabs align="center" content-class="mt-3" class="mt-2 p-3">
                        <b-tab active>
                            <template #title>
                                <i class="fas fa-sign-in-alt"></i> Logowanie
                            </template>
                            <h2 class="h5 m-3">Zaloguj się</h2>
                            <form>
                                <div class="form-group m-2">
                                    <label for="email">Email</label>
                                    <input type="email" name="email" class="form-control">
                                </div>
                                <div class="form-group m-2">
                                    <label for="password">Hasło</label>
                                    <input type="password" name="password" class="form-control">
                                </div>
                                <button type="submit" class="btn btn-primary m-2 d-block float-end">Zaloguj</button>
                            </form>
                        </b-tab>

                        <b-tab>
                            <template #title>
                                <i class="fas fa-user-plus"></i> Rejestracja
                            </template>
                            <p>TODO</p>
                        </b-tab>
                            
                    </b-tabs>
                </div>
            </div>
        </div>
    </header>
</template>